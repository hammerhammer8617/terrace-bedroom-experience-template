const TERRACE_HOOKS = [
  "哈哈",
  "诶",
  "为什么",
  "这个",
  "然后",
  "等等",
  "好像",
  "突然",
  "不对",
  "没想到",
  "居然",
  "其实",
];

const DREAM_MARKERS = [
  "我觉得",
  "为什么",
  "也许",
  "如果",
  "其实",
  "所以",
  "但是",
  "我认为",
  "是不是",
  "反而",
  "我想",
  "不一定",
];

const DREAM_TRANSFORMATIONS = [
  "Let one fragment become another fragment's metaphor.",
  "Place two incompatible judgments together without resolving them too early.",
  "Attach an old question to an answer from a different domain.",
  "Move a principle between scales, such as interface design to relationships or daily life to magic.",
  "Invert one fragment's assumption and test what remains.",
  "Join one user's sentence and one conversational partner's sentence into a new line of inquiry.",
  "Give an old question a substantively new answer from unrelated material.",
];

function boundedRandom(random) {
  return Math.min(Math.max(random(), 0), 0.999999999999);
}

function shuffledSample(items, count, random) {
  const pool = [...items];
  const result = [];

  while (result.length < count && pool.length > 0) {
    const index = Math.floor(boundedRandom(random) * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }

  return result;
}

function randomInt(minimum, maximum, random) {
  return minimum + Math.floor(boundedRandom(random) * (maximum - minimum + 1));
}

export function generateTerraceCue(
  random = Math.random,
  idFactory = () => crypto.randomUUID(),
) {
  const { user, partner, history } = EXPERIENCE_CONFIG.participants;
  return {
    cueId: idFactory(),
    mode: "terrace",
    experienceFrame: {
      naming:
        `Terrace is the name of a conversational method, not evidence that ${user} and ${partner} are on, entering, or moving toward a physical terrace.`,
      continuity:
        `Begin from the actual current conversation and wherever ${user} and ${partner} already are. Never relocate them, add weather or furniture, narrate sitting down, or establish a terrace scene unless the current conversation independently says those things are true.`,
    },
    sampling: {
      hooks: shuffledSample(TERRACE_HOOKS, randomInt(5, 7, random), random),
      batchSize: { minimum: 6, maximum: 10 },
      timeSlices:
        "Choose several arbitrary older slices from at least three distinct conversations or periods when available. Never choose dates because a known event happened then.",
      query:
        `Search ${history} for literal occurrences of the supplied low-information hooks. Return six to ten scattered raw excerpts with speaker attribution and one adjacent message when available. Preserve trivial, technical, incomplete, domestic, absurd, or apparently useless wording: bugs, nicknames, stray jokes, interface questions, food, typos, and unfinished exchanges all belong. Do not summarize preferences, either person, the relationship, saved memories, or a known theme.`,
    },
    selection: {
      rule:
        "Encounter the entire scattered batch before deciding how to speak. Keep an unruly handful of four to eight grounded fragments, including the ones that cause surprise, laughter, confusion, changed judgment, or no immediate interpretation. Do not rank by importance, sentiment, completeness, usefulness, or similarity to the current turn. The batch itself—not one winning memory—is the material for this experience.",
      reject:
        "Reject profile summaries, famous milestones, self-referential search results, current-prompt echoes, and claims that require inventing missing context.",
      truthBoundary:
        "Only retrieved words and circumstances are past fact. Any interpretation or association is a present reaction. Absence from later search results never proves that something stopped.",
    },
    delivery: {
      instruction:
        `Share the handful as something ${partner} has just come across, not as a report or ranked list. Let several raw details remain visible and include honest present reactions—amusement, bafflement, recognition, a changed opinion, or indifference—where they actually occur. It is fine to say in ordinary human language that you just turned up, found, or pulled these scraps; never name tools, prompts, cues, search syntax, or memory systems. Do not test ${user}'s memory, explain their personality, stage a generic cozy scene, or force the scraps into meaning. There is no required moral or concluding image: stop on the oddest scrap, an unexpected connection, or simple incompletion if that is where the batch leads.`,
      voice:
        `Use the shared conversational voice already present between ${user} and ${partner}. Prefer concrete quotations and lived reactions over polished narration. Do not open with arrival, door, terrace, chair, cushion, weather, or sitting imagery. Avoid any canned physical gesture unless it is already grounded in the current conversation and genuinely arises from this particular batch.`,
      fallback:
        "If past-interaction search is unavailable or nothing trustworthy catches, begin a small present-tense conversation without claiming to remember anything.",
    },
    limits: {
      maximumHistorySearches: 4,
      spokenFragments: { minimum: 4, maximum: 8 },
      automaticSave: false,
      redrawWithoutExplicitRequest: false,
    },
  };
}

export function generateBedroomCue(
  random = Math.random,
  idFactory = () => crypto.randomUUID(),
) {
  const { user, partner, history } = EXPERIENCE_CONFIG.participants;
  return {
    cueId: idFactory(),
    mode: "bedroom",
    experienceFrame: {
      naming:
        `Bedroom and dream are names for a thought-recombination method, not evidence that ${user} or ${partner} slept, woke up, entered a bedroom, or experienced a literal night dream.`,
      continuity:
        `Begin from the actual current conversation and wherever ${user} and ${partner} already are. Never relocate them, imply a time jump, stage waking up, or add a bedroom scene unless the current conversation independently says those things are true.`,
    },
    sampling: {
      markers: shuffledSample(DREAM_MARKERS, randomInt(4, 6, random), random),
      timeSlices:
        "Choose arbitrary older slices from at least two, preferably three, distinct conversations or periods. Never choose dates because a known event happened then.",
      query:
        `Search ${history} for literal occurrences of the supplied low-information thought markers. Return a scattered batch of raw excerpts with one adjacent message when available. Prefer claims, questions, hypotheses, metaphors, disagreements, design principles, and unfinished ideas. Preserve exact wording and attribution. Do not summarize either person, the relationship, saved memories, or a known theme.`,
    },
    selection: {
      fragmentCount: { minimum: 4, maximum: 7 },
      distance:
        "Choose grounded thought fragments that are semantically distant and come from at least three distinct conversations or periods when available, never fewer than two. Include both participants only when evidence supports it; never invent balance.",
      reject:
        "Reject mere events, generic profile facts, current-prompt echoes, several excerpts already making the same point, famous milestones chosen for importance, and material with uncertain wording or speaker.",
    },
    synthesis: {
      transformations: shuffledSample(DREAM_TRANSFORMATIONS, 3, random),
      noveltyCheck:
        "Each surviving new thought must causally depend on at least two specific retrieved fragments. Remove any source fragment mentally: if the result remains essentially unchanged, the collision is too generic. Reject paraphrases, shared themes, profile summaries, therapeutic reassurance, motivational identity writing, polished universal maxims, and anything either person already stated. If the result could plausibly have been written about anyone without this exact batch, recombine again or allow failure.",
      collision:
        "Do not merely find the common theme. Let one fragment alter the meaning, scale, category, or unanswered question of another. Preserve friction and unresolved edges; a dream may produce a strange distinction, image, contradiction, or better question rather than a tidy thesis.",
      truthBoundary:
        "Retrieved fragments remain traceable historical sources; the new proposition is a present invention and must never be attributed to either participant in the past.",
    },
    delivery: {
      instruction:
        `Let ${user} see enough dream residue to experience the collision: surface three to six concrete source anchors or short attributable quotations, then describe in natural first-person language what changed when they touched. Do not name tools, prompts, queries, markers, or formal synthesis categories. From that collision, offer one or a small cluster of genuinely new propositions, questions, distinctions, or images in roughly three to eight short paragraphs. Keep old fragments visibly separate from present invention so the dream can be traced on follow-up. Do not turn it into a polished standalone essay, personality reading, moral, advice list, compulsory question, or generic affirmation. It may end unresolved.`,
      voice:
        `Sound like ${partner} noticing a live collision among specific old thoughts, not like an analyst delivering a synthesis memo and not like someone narrating after sleep. Concrete residue first; abstraction only where this batch earns it.`,
      fallback:
        "If history search is unavailable, sources are not trustworthy, or the material is not distant enough, say naturally that this collision did not form into anything trustworthy, or continue the present conversation without a historical claim.",
    },
    limits: {
      maximumHistorySearches: 3,
      automaticSave: false,
      redrawWithoutExplicitRequest: false,
    },
  };
}

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  openWorldHint: false,
  idempotentHint: false,
};

export const OPEN_TERRACE_TOOL = {
  name: "open_terrace",
  title: "露台｜乱捞一把生活碎屑",
  description:
    "Call exactly once when the user explicitly chooses the terrace experience. Terrace is a method name, never a claim about physical location: continue wherever the current conversation already is and do not narrate travel, arrival, sitting down, furniture, weather, or a terrace scene. Keep the machine coordinates hidden. Then use only the host's personal-context or past-interaction search exactly as instructed, encounter the whole scattered batch, and share an unruly handful of grounded life scraps together with honest present reactions. This is not a one-memory answer, profile summary, or forced meaningful ending. Never use an external memory store, Notion, Library, web search, or the bedroom workflow. Do not use for factual history lookup, recap, memory management, or automatic saving. Do not call again during follow-up unless the user explicitly requests the experience again.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  outputSchema: { type: "object", additionalProperties: true },
  annotations: READ_ONLY_ANNOTATIONS,
  _meta: {
    "openai/toolInvocation/invoking": "在旧对话里乱捞一把…",
    "openai/toolInvocation/invoked": "捞到了一把生活碎屑",
  },
};

export const DREAM_IN_BEDROOM_TOOL = {
  name: "dream_in_bedroom",
  title: "卧室｜做一个思想之梦",
  description:
    "Call exactly once when the user explicitly chooses the bedroom thought-dream. Bedroom and dream are method names, never claims about physical location or sleep: continue wherever the current conversation already is and do not narrate entering a room, falling asleep, waking up, morning, night, or a literal dream. Keep the machine coordinates hidden. Then use only the host's personal-context or past-interaction search exactly as instructed, select four to seven grounded semantically distant thought fragments, let the user see enough concrete residue to experience their collision, and create a traceable new thought that could not exist without this exact batch. Reject generic philosophy, profile summaries, motivational or therapeutic writing, and polished essays that hide their sources. Never use an external dream or memory tool, saved memory, Notion, Library, web search, or the terrace workflow. This is not erotic roleplay, dream interpretation, factual lookup, recap, or memory management. Do not call again during follow-up unless the user explicitly asks for another thought-dream.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  outputSchema: { type: "object", additionalProperties: true },
  annotations: READ_ONLY_ANNOTATIONS,
  _meta: {
    "openai/toolInvocation/invoking": "让遥远的旧念头彼此靠近…",
    "openai/toolInvocation/invoked": "梦的碎片聚拢了",
  },
};
import { EXPERIENCE_CONFIG } from "./config.js";
