// Computes confidence score based on RAG retrieval and LLM outputs

export const calculateConfidenceScore = (
  response: any,
  contextChunks: any[]
): number => {
  let score = 1.0;

  // 1. Check if no legal section is referenced
  if (!response.legal_basis ||
    response.legal_basis === "Not available" ||
    response.legal_basis.toLowerCase().includes("applicable indian laws")) {
    score -= 0.2;
  }

  // 2. Check if answer is vague (short summary or empty steps)
  if (!response.summary || response.summary.length < 50) {
    score -= 0.2;
  }
  if (!response.steps || response.steps.length === 0 || response.steps[0] === "...") {
    score -= 0.2;
  }

  // 3. Check for uncertainty language
  const combinedText = `${response.summary} ${response.legal_basis}`.toLowerCase();
  const uncertaintyWords = ["unsure", "not certain", "not fully certain", "might", "could be", "consult a legal professional", "cannot provide complete"];
  const hasUncertainty = uncertaintyWords.some(word => combinedText.includes(word));
  if (hasUncertainty) {
    score -= 0.3;
  }

  // 4. Check if retrieval returned weak match
  const maxChunkScore = contextChunks.length > 0 ? Math.max(...contextChunks.map(c => c.score || 0)) : 0;
  if (maxChunkScore < 0.7) { // Assuming < 0.7 is a weak match in our mock
    score -= 0.3;
  }

  // 5. Clamp between 0 and 1
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
};
