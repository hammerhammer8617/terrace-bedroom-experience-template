import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const sourceFiles = [
  new URL("../src/index.js", import.meta.url),
  new URL("../src/cues.js", import.meta.url),
  new URL("../src/widget.js", import.meta.url),
  new URL("../src/config.js", import.meta.url),
];

test("server has no persistence, analytics, auth, or outbound fetch implementation", async () => {
  const source = (await Promise.all(sourceFiles.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /KVNamespace|D1Database|R2Bucket|DurableObject/);
  assert.doesNotMatch(source, /analytics|telemetry|tracking|cookie|localStorage/i);
  assert.doesNotMatch(source, /authorization|bearer|oauth|api[_-]?key/i);
  assert.doesNotMatch(source, /fetch\(\s*["'`]https?:/);
  assert.doesNotMatch(source, /private participant|private hostname/i);
});
