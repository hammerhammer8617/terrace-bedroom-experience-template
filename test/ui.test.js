import assert from "node:assert/strict";
import test from "node:test";

import worker from "../src/index.js";

async function rpc(body) {
  return worker.fetch(
    new Request("https://rooms.test/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

test("resource list exposes one MCP App widget", async () => {
  const response = await rpc({ jsonrpc: "2.0", id: 1, method: "resources/list" });
  const body = await response.json();
  assert.equal(body.result.resources.length, 1);
  assert.equal(body.result.resources[0].mimeType, "text/html;profile=mcp-app");
});

test("widget has exactly two first-level buttons and no nested navigation", async () => {
  const response = await rpc({
    jsonrpc: "2.0",
    id: 2,
    method: "resources/read",
    params: { uri: "ui://terrace-bedroom/doorway-v1.html" },
  });
  const body = await response.json();
  const resource = body.result.contents[0];
  assert.equal(resource.mimeType, "text/html;profile=mcp-app");
  assert.equal((resource.text.match(/<button\b/g) ?? []).length, 2);
  assert.match(resource.text, /来一次露台吧。/);
  assert.match(resource.text, /做个思想之梦吧。/);
  assert.doesNotMatch(resource.text, /private participant|private hostname/i);
  assert.match(resource.text, /不必动身。随便挑一种。/);
  assert.match(resource.text, /乱捞一把生活留下的碎屑/);
  assert.match(resource.text, /让几段遥远的旧念头碰一碰/);
  assert.doesNotMatch(resource.text, /醒来后留下什么/);
  assert.match(resource.text, /sendFollowUpMessage/);
  assert.match(resource.text, /"ui\/message"/);
  assert.doesNotMatch(resource.text, /<nav\b|<select\b|<details\b/);
  assert.doesNotMatch(resource.text, /门开了。/);
  assert.doesNotMatch(resource.text, /<h1\b|class="eyebrow"|class="subtitle"/);
  assert.doesNotMatch(resource.text, /border-radius:\s*14px|border:\s*1px solid var\(--line\)/);
  assert.equal(resource._meta.ui.prefersBorder, false);
  assert.deepEqual(resource._meta.ui.csp.connectDomains, []);
});

test("unknown resources fail cleanly", async () => {
  const response = await rpc({
    jsonrpc: "2.0",
    id: 3,
    method: "resources/read",
    params: { uri: "ui://unknown" },
  });
  const body = await response.json();
  assert.equal(body.error.code, -32002);
});
