import natural from "natural";

const tokenizer = new natural.WordTokenizer();
const stem = (w: string) => natural.PorterStemmer.stem(w);

// natural ships a base English stopword list; extend it with resume boilerplate.
const STOPWORDS = new Set<string>([
  ...natural.stopwords,
  "experience",
  "work",
  "team",
  "role",
  "responsibilities",
  "requirements",
  "company",
  "job",
  "candidate",
  "years",
  "year",
  "strong",
  "good",
  "ability",
  "including",
  "etc",
  "well",
  "using",
  "new",
]);

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ") // keep tech tokens like c++, c#, node.js
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  return (tokenizer.tokenize(normalize(text)) ?? []).filter(Boolean);
}

/** An index of a resume optimised for fast phrase and fuzzy term matching. */
export type ResumeIndex = {
  normalizedText: string;
  tokens: string[];
  tokenSet: Set<string>;
  stemSet: Set<string>;
};

export function buildResumeIndex(resumeText: string): ResumeIndex {
  const normalizedText = normalize(resumeText);
  const tokens = tokenize(resumeText);
  return {
    normalizedText,
    tokens,
    tokenSet: new Set(tokens),
    stemSet: new Set(tokens.map(stem)),
  };
}

/**
 * Does the resume contain `term`? Multi-word terms are matched as phrases;
 * single words match on exact token, stem, or a close fuzzy match (typos).
 */
export function matchesTerm(index: ResumeIndex, term: string): boolean {
  const t = normalize(term);
  if (!t) return false;

  if (t.includes(" ")) {
    // Phrase: require the whole phrase, or all significant words present.
    if (index.normalizedText.includes(t)) return true;
    const words = t.split(" ").filter((w) => w.length > 1);
    return words.length > 0 && words.every((w) => wordPresent(index, w));
  }
  return wordPresent(index, t);
}

function wordPresent(index: ResumeIndex, word: string): boolean {
  if (index.tokenSet.has(word)) return true;
  if (index.stemSet.has(stem(word))) return true;
  // Fuzzy fallback for longer words to tolerate minor typos/variants.
  if (word.length >= 5) {
    for (const token of index.tokenSet) {
      if (
        Math.abs(token.length - word.length) <= 2 &&
        natural.JaroWinklerDistance(token, word, { ignoreCase: true }) >= 0.92
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Extract the most salient keywords from a job description using TF-IDF over its
 * sentences (so terms repeated across the JD rank highest), filtered of
 * stopwords. Returns lower-cased unigram keywords, most important first.
 */
export function extractKeywords(text: string, limit = 25): string[] {
  const tfidf = new natural.TfIdf();
  const sentences = text
    .split(/[.\n•;]+/)
    .map((s) => normalize(s))
    .filter((s) => s.split(" ").length >= 2);

  if (sentences.length === 0) sentences.push(normalize(text));
  sentences.forEach((s) => tfidf.addDocument(s));

  const scores = new Map<string, number>();
  sentences.forEach((_, i) => {
    tfidf.listTerms(i).forEach(({ term, tfidf: score }) => {
      if (isCandidate(term)) {
        scores.set(term, (scores.get(term) ?? 0) + score);
      }
    });
  });

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term]) => term);
}

function isCandidate(term: string): boolean {
  return (
    term.length > 2 &&
    !STOPWORDS.has(term) &&
    !/^\d+$/.test(term) && // pure numbers
    /[a-z]/.test(term)
  );
}
