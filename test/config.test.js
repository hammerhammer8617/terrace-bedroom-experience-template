import assert from "node:assert/strict";
import test from "node:test";

import { EXPERIENCE_CONFIG } from "../src/config.js";

test("shareable defaults are generic and internally complete", () => {
  assert.equal(EXPERIENCE_CONFIG.server.version, "0.1.0");
  assert.ok(EXPERIENCE_CONFIG.doorway.terrace.prompt);
  assert.ok(EXPERIENCE_CONFIG.doorway.bedroom.prompt);
  assert.doesNotMatch(
    JSON.stringify(EXPERIENCE_CONFIG),
    /private participant|private hostname/i,
  );
});
