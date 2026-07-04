/**
 * Computes derived trade fields: profitLoss, profitLossPercent, riskReward, result
 */
export function computeTradeFields(params: {
  direction: string;
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  stopLoss?: number | null;
  commission?: number | null;
}) {
  const { direction, entryPrice, exitPrice, positionSize, stopLoss, commission } = params;

  const priceMove = direction === "long"
    ? exitPrice - entryPrice
    : entryPrice - exitPrice;

  let profitLoss = priceMove * positionSize;
  if (commission) profitLoss -= Math.abs(commission);

  const profitLossPercent = entryPrice > 0
    ? (priceMove / entryPrice) * 100
    : 0;

  let riskReward: number | null = null;
  if (stopLoss != null && stopLoss > 0) {
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(exitPrice - entryPrice);
    riskReward = risk > 0 ? reward / risk : null;
  }

  let result: "win" | "loss" | "breakeven";
  if (profitLoss > 0) result = "win";
  else if (profitLoss < 0) result = "loss";
  else result = "breakeven";

  return {
    profitLoss: profitLoss.toFixed(8),
    profitLossPercent: profitLossPercent.toFixed(4),
    riskReward: riskReward !== null ? riskReward.toFixed(4) : null,
    result,
  };
}
