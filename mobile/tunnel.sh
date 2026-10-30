#!/usr/bin/env bash
# tunnel.sh — bulletproof Expo tunnel launcher for the Adl app.
# ngrok occasionally returns empty/garbage responses ("Cannot read properties
# of undefined (reading 'body')" / "remote gone away"). This script simply
# retries until the tunnel is actually serving, then prints a scannable QR.
set -u

cd "$(dirname "$0")"
LOG=/tmp/expo.log
MAX=8

print_qr() {
  local url="$1"
  node -e "require('qrcode-terminal').generate('$url',{small:true})" 2>/dev/null
  node -e "require('qrcode').toFile('/tmp/adl-qr.png','$url',{width:720,margin:3,color:{dark:'#000000',light:'#FFFFFF'}})" 2>/dev/null
  echo ""
  echo "  >> Open in Expo Go:  $url"
}

for i in $(seq 1 $MAX); do
  echo "== Tunnel attempt $i/$MAX =="
  pkill -f "expo start" 2>/dev/null
  pkill -f ngrok 2>/dev/null
  sleep 4

  EXPO_NO_DEPENDENCY_VALIDATION=1 nohup npx expo start --tunnel > "$LOG" 2>&1 &

  # Wait for Metro + tunnel to come up (up to ~40s).
  url=""
  for _ in $(seq 1 20); do
    sleep 2
    if grep -q "exp.direct" "$LOG" 2>/dev/null; then
      url=$(grep -aoE "exp://[a-z0-9-]+\.exp\.direct" "$LOG" | tail -1)
      [ -n "$url" ] && break
    fi
    if grep -qE "CommandError|failed to start tunnel|gone away" "$LOG" 2>/dev/null; then
      break
    fi
  done

  # Fallback: pull host URI from the manifest if the log didn't print it.
  if [ -z "$url" ]; then
    host=$(curl -s -m 8 http://localhost:8081 -H "Expo-Platform: ios" \
      -H "Accept: application/expo+json,application/json" \
      | tr ',' '\n' | grep -ai "hostUri" | grep -aoE "[a-z0-9-]+\.exp\.direct" | tail -1)
    [ -n "$host" ] && url="exp://$host"
  fi

  if [ -n "$url" ]; then
    echo ""
    echo "TUNNEL READY."
    print_qr "$url"
    exit 0
  fi

  echo "   ...ngrok hiccup, retrying."
done

echo "Tunnel failed after $MAX attempts (ngrok outage). Try again shortly."
exit 1
