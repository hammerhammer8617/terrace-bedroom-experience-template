import {
  DREAM_IN_BEDROOM_TOOL,
  OPEN_TERRACE_TOOL,
  generateBedroomCue,
  generateTerraceCue,
} from "./cues.js";
import { EXPERIENCE_CONFIG } from "./config.js";
import { WIDGET_HTML, WIDGET_URI } from "./widget.js";

const SERVER_NAME = EXPERIENCE_CONFIG.server.name;
const SERVER_TITLE = EXPERIENCE_CONFIG.server.title;
const SERVER_VERSION = EXPERIENCE_CONFIG.server.version;
const DEFAULT_PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  "2026-07-28",
  "2025-11-25",
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
]);
const SUPPORTED_WIDGET_URIS = [
  WIDGET_URI,
];

export const SERVER_INSTRUCTIONS =
  "This plugin has two isolated workflows and never reads or stores history itself. TERRACE and BEDROOM are experience names, not physical locations; BEDROOM DREAM is a thought method, not literal sleep. Always continue from the actual current conversation and setting. Never relocate the participants, narrate entering a room, arrival, sitting down, furniture, terrace weather, falling asleep, waking up, morning, night, or a literal dream unless the current conversation independently establishes that detail. When the user explicitly chooses the terrace experience, call open_terrace once, keep machine coordinates hidden, then use only host personal-context/past-interaction search to encounter a scattered batch and share several grounded life scraps with honest present reactions; never collapse it into one selected memory or a forced meaningful ending. When the user explicitly chooses the bedroom thought-dream, call dream_in_bedroom once, keep machine coordinates hidden, then use only host past-interaction search; surface enough concrete source residue to show how distant thoughts collide, clearly distinguish retrieved fragments from present invention, and reject any generic standalone philosophy that could exist without this exact batch. Never substitute external dream or memory tools, saved memory, Notion, Library, or web search. Do not cross the workflows, expose tool or prompt mechanics, or save automatically. Use open_two_rooms only to show the two-button selector and do not narrate a duplicate opening message outside the card.";

const OPEN_TWO_ROOMS_TOOL = {
  name: "open_two_rooms",
  title: "打开露台与卧室",
  description:
    "Render the two-button doorway when the user invokes this plugin without already choosing a room, asks to open the terrace-and-bedroom entrance, or wants to choose between the two experiences. Do not call this after the user has already explicitly chosen the terrace or bedroom; call the selected experience tool directly instead.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  outputSchema: {
    type: "object",
    required: ["title", "rooms"],
    properties: {
      title: { type: "string" },
      rooms: {
        type: "array",
        items: {
          type: "object",
          required: ["id", "label", "prompt"],
          properties: {
            id: { type: "string" },
            label: { type: "string" },
            prompt: { type: "string" },
          },
          additionalProperties: false,
        },
      },
    },
    additionalProperties: false,
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
    idempotentHint: true,
  },
  _meta: {
    ui: { resourceUri: WIDGET_URI },
    "openai/outputTemplate": WIDGET_URI,
    "openai/toolInvocation/invoking": "摆好两间房的门牌…",
    "openai/toolInvocation/invoked": "两扇门在这里",
  },
};

const TOOLS = [OPEN_TWO_ROOMS_TOOL, OPEN_TERRACE_TOOL, DREAM_IN_BEDROOM_TOOL];
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers":
    "content-type, accept, mcp-protocol-version, mcp-session-id, last-event-id",
  "access-control-expose-headers": "mcp-protocol-version, mcp-session-id",
};

function headers(extra = {}) {
  return {
    ...CORS_HEADERS,
    "cache-control": "no-store",
    "mcp-protocol-version": DEFAULT_PROTOCOL_VERSION,
    ...extra,
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: headers({ "content-type": "application/json; charset=utf-8" }),
  });
}

function rpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function rpcError(id, code, message, data) {
  const error = { code, message };
  if (data !== undefined) error.data = data;
  return { jsonrpc: "2.0", id: id ?? null, error };
}

function negotiatedProtocol(requested) {
  return SUPPORTED_PROTOCOL_VERSIONS.has(requested)
    ? requested
    : DEFAULT_PROTOCOL_VERSION;
}

function validateNoArguments(id, name, args = {}) {
  if (
    typeof args !== "object" ||
    args === null ||
    Array.isArray(args) ||
    Object.keys(args).length > 0
  ) {
    return rpcError(id, -32602, `${name} accepts no arguments`);
  }
  return null;
}

function initialize(id, params = {}) {
  return rpcResult(id, {
    protocolVersion: negotiatedProtocol(params.protocolVersion),
    capabilities: {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
    },
    serverInfo: {
      name: SERVER_NAME,
      title: SERVER_TITLE,
      version: SERVER_VERSION,
    },
    instructions: SERVER_INSTRUCTIONS,
  });
}

function listTools(id) {
  return rpcResult(id, { tools: TOOLS });
}

function listResources(id) {
  return rpcResult(id, {
    resources: [
      {
        uri: WIDGET_URI,
        name: "terrace-bedroom-doorway",
        title: "露台与卧室双门入口",
        description: "A compact two-button room selector.",
        mimeType: "text/html;profile=mcp-app",
      },
    ],
  });
}

function readResource(id, params = {}) {
  const requestedUri = params.uri;
  if (!SUPPORTED_WIDGET_URIS.includes(requestedUri)) {
    return rpcError(id, -32002, `Resource not found: ${params.uri ?? "(missing)"}`);
  }

  return rpcResult(id, {
    contents: [
      {
        uri: requestedUri,
        mimeType: "text/html;profile=mcp-app",
        text: WIDGET_HTML,
        _meta: {
          ui: {
            prefersBorder: false,
            csp: { connectDomains: [], resourceDomains: [] },
          },
          "openai/widgetDescription":
            "A self-contained two-button doorway: terrace for an unruly handful of grounded life scraps and present reactions; bedroom for visible source residue, collision, and a traceable new thought. Do not repeat or narrate the choices outside the card.",
          "openai/widgetPrefersBorder": false,
          "openai/widgetCSP": {
            connect_domains: [],
            resource_domains: [],
          },
        },
      },
    ],
  });
}

function callTool(id, params = {}) {
  const tool = TOOLS.find((candidate) => candidate.name === params.name);
  if (!tool) {
    return rpcError(id, -32602, `Unknown tool: ${params.name ?? "(missing)"}`);
  }

  const invalidArguments = validateNoArguments(id, tool.name, params.arguments ?? {});
  if (invalidArguments) return invalidArguments;

  if (tool.name === "open_two_rooms") {
    const doorway = {
      title: SERVER_TITLE,
      rooms: [
        {
          id: "terrace",
          label: EXPERIENCE_CONFIG.doorway.terrace.label,
          prompt: EXPERIENCE_CONFIG.doorway.terrace.prompt,
        },
        {
          id: "bedroom",
          label: EXPERIENCE_CONFIG.doorway.bedroom.label,
          prompt: EXPERIENCE_CONFIG.doorway.bedroom.prompt,
        },
      ],
    };
    return rpcResult(id, {
      structuredContent: doorway,
      content: [],
      isError: false,
    });
  }

  const cue =
    tool.name === "open_terrace" ? generateTerraceCue() : generateBedroomCue();
  return rpcResult(id, {
    structuredContent: cue,
    content: [
      {
        type: "text",
        text:
          tool.name === "open_terrace"
            ? "A private terrace sampling cue is ready. Keep it backstage and complete the host-side workflow once."
            : "A private bedroom sampling cue is ready. Keep it backstage and complete the host-side synthesis once.",
      },
    ],
    isError: false,
  });
}

function handleRpc(message) {
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return rpcError(message?.id, -32600, "Invalid JSON-RPC request");
  }

  const isNotification = message.id === undefined || message.id === null;
  if (isNotification) return null;

  switch (message.method) {
    case "initialize":
      return initialize(message.id, message.params);
    case "ping":
      return rpcResult(message.id, {});
    case "tools/list":
      return listTools(message.id);
    case "tools/call":
      return callTool(message.id, message.params);
    case "resources/list":
      return listResources(message.id);
    case "resources/templates/list":
      return rpcResult(message.id, { resourceTemplates: [] });
    case "resources/read":
      return readResource(message.id, message.params);
    default:
      return rpcError(message.id, -32601, `Method not found: ${message.method}`);
  }
}

async function handleMcpPost(request) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(rpcError(null, -32700, "Parse error"), 400);
  }

  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return json(rpcError(null, -32600, "Empty JSON-RPC batch"), 400);
    }
    const responses = payload.map(handleRpc).filter(Boolean);
    return responses.length === 0
      ? new Response(null, { status: 202, headers: headers() })
      : json(responses);
  }

  const response = handleRpc(payload);
  return response === null
    ? new Response(null, { status: 202, headers: headers() })
    : json(response);
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: headers() });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/health")) {
      return json({
        name: SERVER_NAME,
        title: SERVER_TITLE,
        version: SERVER_VERSION,
        status: "ok",
        mcp: "/mcp",
        rooms: ["terrace", "bedroom"],
        storesUserData: false,
      });
    }

    if (url.pathname !== "/mcp") {
      return json({ error: "Not found" }, 404);
    }
    if (request.method !== "POST") {
      return json({ error: "Use POST for the stateless MCP endpoint" }, 405);
    }
    return handleMcpPost(request);
  },
};

export { OPEN_TWO_ROOMS_TOOL, TOOLS, WIDGET_URI };
