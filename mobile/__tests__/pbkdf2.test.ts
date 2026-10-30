/**
 * Tests for the pure PBKDF2-HMAC-SHA256 implementation, against published
 * SHA-256 and PBKDF2 test vectors.
 */
import { sha256, pbkdf2Hex, utf8, toHex } from '../lib/auth/pbkdf2';

describe('sha256', () => {
  it('hashes the empty string', () => {
    expect(toHex(sha256(utf8('')))).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('hashes "abc"', () => {
    expect(toHex(sha256(utf8('abc')))).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('hashes a multi-block message', () => {
    expect(toHex(sha256(utf8('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')))).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1',
    );
  });
});

describe('pbkdf2-hmac-sha256 (known vectors)', () => {
  it('password/salt, c=1, dkLen=32', () => {
    expect(pbkdf2Hex('password', 'salt', 1, 32)).toBe(
      '120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b',
    );
  });

  it('password/salt, c=2, dkLen=32', () => {
    expect(pbkdf2Hex('password', 'salt', 2, 32)).toBe(
      'ae4d0c95af6b46d32d0adff928f06dd02a303f8ef3c251dfd6e2d85a95474c43',
    );
  });

  it('password/salt, c=4096, dkLen=32', () => {
    expect(pbkdf2Hex('password', 'salt', 4096, 32)).toBe(
      'c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a',
    );
  });

  it('long password/salt, c=4096, dkLen=40 (spans two blocks)', () => {
    expect(
      pbkdf2Hex('passwordPASSWORDpassword', 'saltSALTsaltSALTsaltSALTsaltSALTsalt', 4096, 40),
    ).toBe('348c89dbcbd32b2f32d814b8116e84cf2b17347ebc1800181c4e2a1fb8dd53e1c635518c7dac47e9');
  });

  it('is deterministic and unique per salt', () => {
    expect(pbkdf2Hex('secret', 'aa', 1000, 32)).toBe(pbkdf2Hex('secret', 'aa', 1000, 32));
    expect(pbkdf2Hex('secret', 'aa', 1000, 32)).not.toBe(pbkdf2Hex('secret', 'bb', 1000, 32));
  });
});
