import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';

const root = fileURLToPath(new URL('..', import.meta.url));
const baselinePath = resolve(root, '.prettier-baseline.json');
const updating = process.argv.includes('--update-baseline');
const baseline = existsSync(baselinePath) ? JSON.parse(await readFile(baselinePath, 'utf8')) : {};
const paths = new Set(
  execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '.'], {
    cwd: root,
    encoding: 'utf8',
  })
    .split('\0')
    .filter(Boolean),
);
paths.add('../.github/workflows/ci.yml');

const debt = {};
const failures = [];
let checked = 0;
let unchanged = 0;

for (const relativePath of [...paths].sort()) {
  const filepath = resolve(root, relativePath);
  if (!existsSync(filepath)) continue;
  const info = await prettier.getFileInfo(filepath, {
    ignorePath: resolve(root, '.prettierignore'),
  });
  if (info.ignored || !info.inferredParser) continue;
  const options = (await prettier.resolveConfig(filepath)) ?? {};
  const source = await readFile(filepath, 'utf8');
  checked += 1;
  if (await prettier.check(source, { ...options, filepath })) continue;
  const hash = createHash('sha256').update(source).digest('hex');
  debt[relativePath] = hash;
  if (baseline[relativePath] === hash) unchanged += 1;
  else failures.push(relativePath);
}

if (updating) {
  await writeFile(baselinePath, `${JSON.stringify(debt, null, 2)}\n`);
  console.log(`Recorded ${Object.keys(debt).length} legacy formatting files (${checked} checked).`);
} else if (failures.length) {
  console.error('Format these new or changed files with npm run format -- <paths>:');
  for (const filepath of failures) console.error(`  ${filepath}`);
  process.exitCode = 1;
} else {
  console.log(`Formatting passed: ${checked} files checked; ${unchanged} unchanged legacy files.`);
}
