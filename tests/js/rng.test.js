const test = require('node:test');
const assert = require('node:assert/strict');
const { hashString, mulberry32, seededShuffle, generateRandomCode } = require('../../js/rng.js');

test('hashString should produce deterministic 32-bit uint', () => {
  const hash1 = hashString('HADES-1');
  const hash2 = hashString('HADES-1');
  assert.equal(hash1, hash2);
  assert.equal(typeof hash1, 'number');
  assert.ok(hash1 >= 0 && hash1 <= 4294967295);
});

test('hashString should differentiate distinct strings', () => {
  const hA = hashString('HADES-1_SEC');
  const hB = hashString('HADES-1_MIS');
  assert.notEqual(hA, hB);
});

test('mulberry32 should produce deterministic sequences for identical seeds', () => {
  const rng1 = mulberry32(12345);
  const rng2 = mulberry32(12345);

  const seq1 = [rng1(), rng1(), rng1(), rng1(), rng1()];
  const seq2 = [rng2(), rng2(), rng2(), rng2(), rng2()];

  assert.deepEqual(seq1, seq2);
});

test('mulberry32 generates numbers in [0, 1)', () => {
  const rng = mulberry32(99999);
  for (let i = 0; i < 500; i++) {
    const val = rng();
    assert.ok(val >= 0 && val < 1, `Value ${val} out of bounds [0, 1)`);
  }
});

test('seededShuffle preserves array elements without losing or duplicating items', () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const rng = mulberry32(42);
  const shuffled = seededShuffle(original, rng);

  assert.equal(shuffled.length, original.length);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), original);
  // Ensure immutability of the original array
  assert.deepEqual(original, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('seededShuffle is strictly reproducible across runs', () => {
  const deck = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rng1 = mulberry32(hashString('ROOM_TEST_1'));
  const rng2 = mulberry32(hashString('ROOM_TEST_1'));

  const s1 = seededShuffle(deck, rng1);
  const s2 = seededShuffle(deck, rng2);

  assert.deepEqual(s1, s2);
});

test('generateRandomCode returns a string with valid prefix and 2-digit number', () => {
  const code = generateRandomCode();
  assert.match(code, /^[A-Z]+-\d{2}$/);
});
