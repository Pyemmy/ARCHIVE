import test from 'node:test';
import assert from 'node:assert/strict';
import { TRACKS } from './tracks.ts';

test('listening room tracks have valid schema and licensing', () => {
  assert.ok(TRACKS.length > 0, 'Listening room should have at least 1 track');
  for (const track of TRACKS) {
    assert.ok(track.id, 'Track must have id');
    assert.ok(track.title, `Track ${track.id} must have title`);
    assert.ok(track.artist, `Track ${track.id} must have artist`);
    assert.ok(['file', 'youtube', 'spotify', 'audiomack'].includes(track.kind), `Invalid kind for ${track.id}`);
    assert.ok(track.src, `Track ${track.id} must have src`);
    assert.ok(track.cover, `Track ${track.id} must have cover`);
    assert.ok(track.credit, `Track ${track.id} must have credit`);
    assert.ok(track.licence, `Track ${track.id} must have licence`);
    assert.ok(track.durationLabel, `Track ${track.id} must have durationLabel`);
  }
});
