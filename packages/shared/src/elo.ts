export interface EloConfig {
  provisionalMatches: number;
  kProvisional: number;
  kRegular: number;
  kHigh: number;
  highRankThreshold: number;
}

export const defaultEloConfig: EloConfig = {
  provisionalMatches: 10,
  kProvisional: 40,
  kRegular: 25,
  kHigh: 15,
  highRankThreshold: 1800
};

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function resolveK(
  rating: number,
  provisionalMatches: number,
  config: EloConfig
): number {
  if (provisionalMatches < config.provisionalMatches) {
    return config.kProvisional;
  }
  if (rating >= config.highRankThreshold) {
    return config.kHigh;
  }
  return config.kRegular;
}

export function applyEloResult(
  ratingA: number,
  ratingB: number,
  scoreA: 0 | 0.5 | 1,
  config: EloConfig,
  provisionalMatchesA: number,
  provisionalMatchesB: number
): { nextRatingA: number; nextRatingB: number } {
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = expectedScore(ratingB, ratingA);
  const kA = resolveK(ratingA, provisionalMatchesA, config);
  const kB = resolveK(ratingB, provisionalMatchesB, config);

  const nextRatingA = Math.round(ratingA + kA * (scoreA - expectedA));
  const nextRatingB = Math.round(ratingB + kB * ((1 - scoreA) - expectedB));

  return { nextRatingA, nextRatingB };
}
