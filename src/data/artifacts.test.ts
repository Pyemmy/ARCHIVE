import test from 'node:test';
import assert from 'node:assert/strict';
import { ARTIFACTS } from './artifacts.ts';

test('every artifact has valid required fields for archival and conceptual kinds', () => {
  assert.ok(ARTIFACTS.length >= 17, 'Should have at least 17 artifacts');
  for (const item of ARTIFACTS) {
    assert.ok(item.id, `Missing id for ${JSON.stringify(item)}`);
    assert.ok(item.title, `Missing title for ${item.id}`);
    assert.ok(item.caption, `Missing caption for ${item.id}`);
    assert.ok(item.file, `Missing file for ${item.id}`);
    assert.ok(item.alt, `Missing alt for ${item.id}`);
    assert.ok(
      item.kind === 'archival' || item.kind === 'conceptual',
      `Item ${item.id} kind must be 'archival' or 'conceptual'`
    );
    if (item.kind === 'archival') {
      assert.ok(item.makerCulture, `Missing makerCulture for archival item ${item.id}`);
      assert.ok(item.date, `Missing date for archival item ${item.id}`);
      assert.ok(item.creditLine, `Missing creditLine for archival item ${item.id}`);
      assert.ok(item.licence, `Missing licence for archival item ${item.id}`);
      assert.ok(item.sourceUrl, `Missing sourceUrl for archival item ${item.id}`);
      assert.equal(typeof item.sacred, 'boolean', `Missing sacred boolean for archival item ${item.id}`);
    }
    assert.ok(Array.isArray(item.motifs) && item.motifs.length > 0, `Item ${item.id} must have motifs`);
  }
});

test('every artifact relates to at least 2 others across at least 2 disciplines', () => {
  const artifactMap = new Map(ARTIFACTS.map(a => [a.id, a]));
  for (const item of ARTIFACTS) {
    assert.ok(item.relatedIds.length >= 2, `${item.id} must relate to at least 2 artifacts`);
    const otherDisciplines = new Set<string>();
    for (const relId of item.relatedIds) {
      const rel = artifactMap.get(relId);
      assert.ok(rel, `Referenced related artifact ${relId} from ${item.id} must exist`);
      if (rel && rel.discipline !== item.discipline) {
        otherDisciplines.add(rel.discipline);
      }
    }
    assert.ok(
      otherDisciplines.size >= 1,
      `${item.id} must relate across disciplines, found: ${Array.from(otherDisciplines).join(', ')}`
    );
  }
});

test('no banned phrases exist in editorial copy', () => {
  const bannedPhrases = [
    'rich tapestry',
    'vibrant',
    'celebrating diversity',
    'preserving heritage',
    'journey'
  ];

  for (const item of ARTIFACTS) {
    const textToCheck = `${item.title} ${item.caption} ${item.alt}`.toLowerCase();
    for (const phrase of bannedPhrases) {
      assert.ok(
        !textToCheck.includes(phrase),
        `Banned phrase "${phrase}" found in artifact ${item.id}`
      );
    }
  }
});
