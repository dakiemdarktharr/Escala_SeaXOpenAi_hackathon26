const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "before", "by", "can", "could",
  "do", "does", "for", "from", "how", "i", "in", "is", "it", "me", "my", "of",
  "on", "or", "our", "please", "the", "this", "to", "we", "what", "when", "where",
  "which", "with", "you", "your",
]);

function terms(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((term) => term.length > 1 && !STOP_WORDS.has(term)) ?? [];
}

function isEffective(document, asOf) {
  if (document.status !== "ACTIVE") return false;
  const effective = Date.parse(String(document.effectiveFrom ?? ""));
  const timestamp = Date.parse(String(asOf ?? ""));
  return Number.isFinite(effective) && Number.isFinite(timestamp) && effective <= timestamp;
}

function searchableTerms(document) {
  return [
    ...terms(document.title).flatMap((term) => [term, term]),
    ...terms(Array.isArray(document.tags) ? document.tags.join(" ") : "").flatMap((term) => [term, term, term]),
    ...terms(document.content),
  ];
}

export function retrieveKnowledge(query, documents, options = {}) {
  const limit = Number.isInteger(options.limit) && options.limit > 0 ? options.limit : 4;
  const eligible = (Array.isArray(documents) ? documents : []).filter((document) =>
    isEffective(document, options.asOf),
  );
  const queryTerms = terms(query);
  if (!queryTerms.length || !eligible.length) {
    return { status: "EMPTY", evidence: [] };
  }

  const corpus = eligible.map((document) => searchableTerms(document));
  const averageLength = corpus.reduce((sum, words) => sum + words.length, 0) / corpus.length || 1;
  const frequencies = new Map();
  for (const term of new Set(queryTerms)) {
    frequencies.set(term, corpus.reduce((count, words) => count + (words.includes(term) ? 1 : 0), 0));
  }

  const ranked = eligible.map((document, index) => {
    const words = corpus[index];
    const counts = new Map();
    for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);
    let score = 0;
    for (const term of queryTerms) {
      const frequency = frequencies.get(term) ?? 0;
      const count = counts.get(term) ?? 0;
      if (!count) continue;
      const inverseDocumentFrequency = Math.log(1 + (eligible.length - frequency + 0.5) / (frequency + 0.5));
      const lengthNorm = 1.5 * (1 - 0.75 + 0.75 * words.length / averageLength);
      score += inverseDocumentFrequency * (count * (1.5 + 1)) / (count + lengthNorm);
    }
    const matchedTerms = [...new Set(queryTerms)].filter((term) => counts.has(term));
    return { document, score, matchedTerms, length: words.length };
  }).filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score
      || String(left.document.id).localeCompare(String(right.document.id)));

  const top = ranked.slice(0, limit);
  const groups = new Map();
  for (const entry of top) {
    const group = typeof entry.document.conflictGroup === "string"
      ? entry.document.conflictGroup.trim()
      : "";
    if (!group) continue;
    const entries = groups.get(group) ?? [];
    entries.push(entry);
    groups.set(group, entries);
  }
  const conflictIds = new Set();
  for (const entries of groups.values()) {
    if (entries.length < 2) continue;
    const distinctFacts = new Set(entries.map((entry) =>
      String(entry.document.content ?? "").trim().toLowerCase()));
    if (distinctFacts.size > 1) {
      for (const entry of entries) conflictIds.add(entry.document.id);
    }
  }

  return {
    status: conflictIds.size ? "CONFLICTING" : top.length ? "FOUND" : "EMPTY",
    evidence: top.map(({ document, score, matchedTerms }) => ({
      id: document.id,
      version: document.version,
      title: document.title,
      content: document.content,
      sourceLabel: document.sourceLabel,
      type: document.type,
      score: Number(score.toFixed(4)),
      matchedTerms,
      ...(conflictIds.has(document.id) ? { conflict: true } : {}),
    })),
  };
}