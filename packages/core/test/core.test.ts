import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  DECK,
  DECK_SIZE,
  getCardById,
  shuffle,
  toggleSelection,
  canConfirm,
  isAtMax,
  randomOrientation,
  revealCards,
  makeWheelLayout,
  cardBaseAngle,
  cardAngle,
  normalizeAngle,
  isCardVisible,
  wrapRotation,
  dragToRotation,
} from '../src/index';

describe('deck', () => {
  it('has exactly 78 unique cards with existing image keys', () => {
    assert.equal(DECK_SIZE, 78);
    assert.equal(new Set(DECK.map((c) => c.id)).size, 78);
    assert.equal(new Set(DECK.map((c) => c.imageKey)).size, 78);
  });

  it('localizes minor-arcana names per the spec examples', () => {
    const aceCups = getCardById('cups-01');
    assert.ok(aceCups);
    assert.deepEqual(aceCups.name, {
      en: 'Ace of Cups',
      zh: '杯一',
      ja: 'カップのエース',
    });
  });

  it('shuffle keeps all cards and does not mutate the source', () => {
    const before = DECK.slice();
    const shuffled = shuffle(DECK, mulberry32(1));
    assert.equal(shuffled.length, 78);
    assert.deepEqual(DECK, before);
    assert.deepEqual(
      new Set(shuffled.map((c) => c.id)),
      new Set(DECK.map((c) => c.id)),
    );
  });
});

describe('selection', () => {
  it('adds, removes, and enforces the 10-card maximum', () => {
    let sel: string[] = [];
    for (let i = 0; i < 10; i++) sel = toggleSelection(sel, `c${i}`).selection;
    assert.equal(sel.length, 10);
    assert.ok(isAtMax(sel));

    const rejected = toggleSelection(sel, 'c10');
    assert.equal(rejected.rejected, true);
    assert.equal(rejected.selection.length, 10);

    const removed = toggleSelection(sel, 'c0');
    assert.equal(removed.rejected, false);
    assert.equal(removed.selection.length, 9);
  });

  it('canConfirm requires at least one card', () => {
    assert.equal(canConfirm([]), false);
    assert.equal(canConfirm(['a']), true);
  });
});

describe('reveal', () => {
  it('assigns a 50/50 orientation and reveals every card', () => {
    assert.equal(randomOrientation(() => 0.1), 'upright');
    assert.equal(randomOrientation(() => 0.9), 'reversed');

    const cards = DECK.slice(0, 5);
    const revealed = revealCards(cards, mulberry32(42));
    assert.equal(revealed.length, 5);
    assert.ok(revealed.every((r) => r.orientation === 'upright' || r.orientation === 'reversed'));
  });
});

describe('rotation', () => {
  const layout = makeWheelLayout(78, 62);

  it('normalizes angles into (-180, 180]', () => {
    assert.equal(normalizeAngle(190), -170);
    assert.equal(normalizeAngle(-190), 170);
    assert.equal(normalizeAngle(0), 0);
  });

  it('spaces cards evenly around a full 360° ring', () => {
    assert.ok(Math.abs(layout.step - 360 / 78) < 1e-9);
    assert.equal(cardBaseAngle(0, layout), 0);
    // Card 0 is at the top when rotation is 0.
    assert.equal(cardAngle(0, 0, layout), 0);
    assert.ok(isCardVisible(cardAngle(0, 0, layout), layout));
  });

  it('loops seamlessly — rotation never clamps at an end', () => {
    // A full turn returns every card to its start position.
    for (const i of [0, 10, 40, 77]) {
      assert.ok(Math.abs(cardAngle(i, 0, layout) - cardAngle(i, 360, layout)) < 1e-9);
    }
    // wrapRotation keeps the value bounded but never blocks further rotation.
    assert.equal(wrapRotation(370), 10);
    assert.equal(wrapRotation(-370), -10);
  });

  it('converts drag pixels to degrees', () => {
    assert.equal(dragToRotation(100, 0.25), 25);
  });
});

/** Small deterministic PRNG for reproducible tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
