import assert from "node:assert/strict";
import test from "node:test";

import { generateBedroomCue, generateTerraceCue } from "../src/cues.js";

function sequence(values) {
  let index = 0;
  return () => values[index++ % values.length];
}

test("terrace cue retrieves and shares an unruly multi-fragment batch", () => {
  const cue = generateTerraceCue(sequence([0, 0.2, 0.4, 0.6, 0.8]), () => "terrace-1");
  assert.equal(cue.cueId, "terrace-1");
  assert.equal(cue.mode, "terrace");
  assert.match(cue.experienceFrame.naming, /conversational method/);
  assert.match(cue.experienceFrame.continuity, /actual current conversation/);
  assert.match(cue.experienceFrame.continuity, /Never relocate/);
  assert.doesNotMatch(JSON.stringify(cue), /private participant|private hostname/i);
  assert.ok(cue.sampling.hooks.length >= 5 && cue.sampling.hooks.length <= 7);
  assert.equal(new Set(cue.sampling.hooks).size, cue.sampling.hooks.length);
  assert.deepEqual(cue.sampling.batchSize, { minimum: 6, maximum: 10 });
  assert.deepEqual(cue.limits.spokenFragments, { minimum: 4, maximum: 8 });
  assert.equal(cue.limits.maximumHistorySearches, 4);
  assert.match(cue.selection.rule, /batch itself/);
  assert.match(cue.delivery.instruction, /honest present reactions/);
  assert.match(cue.delivery.instruction, /no required moral/);
  assert.match(cue.delivery.voice, /Do not open with arrival/);
  assert.doesNotMatch(JSON.stringify(cue), /maximumFragmentsSpoken/);
  assert.equal(cue.limits.automaticSave, false);
});

test("bedroom cue makes sources, collision, traceability, and novelty visible", () => {
  const cue = generateBedroomCue(sequence([0.1, 0.3, 0.5, 0.7, 0.9]), () => "dream-1");
  assert.equal(cue.cueId, "dream-1");
  assert.equal(cue.mode, "bedroom");
  assert.match(cue.experienceFrame.naming, /thought-recombination method/);
  assert.match(cue.experienceFrame.naming, /not evidence.*slept/);
  assert.match(cue.experienceFrame.continuity, /Never relocate/);
  assert.ok(cue.sampling.markers.length >= 4 && cue.sampling.markers.length <= 6);
  assert.equal(cue.synthesis.transformations.length, 3);
  assert.deepEqual(cue.selection.fragmentCount, { minimum: 4, maximum: 7 });
  assert.match(cue.selection.distance, /at least three/);
  assert.match(cue.synthesis.noveltyCheck, /causally depend/);
  assert.match(cue.synthesis.noveltyCheck, /could plausibly have been written about anyone/);
  assert.match(cue.delivery.instruction, /three to six concrete source anchors/);
  assert.match(cue.delivery.instruction, /traced on follow-up/);
  assert.match(cue.delivery.instruction, /polished standalone essay/);
  assert.match(cue.delivery.voice, /not like someone narrating after sleep/);
  assert.doesNotMatch(JSON.stringify(cue), /private participant|private hostname/i);
  assert.doesNotMatch(cue.delivery.fallback, /waking|woke|slept/);
  assert.equal(cue.limits.automaticSave, false);
});
