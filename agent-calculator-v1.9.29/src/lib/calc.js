export const toNumber = (v)=>{
  const n = Number((v??'').toString().replace(/[^0-9.\-]/g,''));
  return Number.isFinite(n)? n : 0;
};
const nz = v => (Number(v)||0);

/**
 * Programs:
 * - Buyer bonus program cap: 1% of price (can expand later)
 * - Display cap rule (example): FHA 6% for closing-credit cap context
 * Splits (planned): AFC 0.375%, AHA 0.375%, Agent 0.25% of price
 * allowed amounts limited by capUsed
 */
export function compute(inputs){
  const price            = nz(toNumber(inputs.price));
  const downPct          = nz(toNumber(inputs.downPct));        // decimal (0.02 = 2%)
  const closingCostPct   = nz(toNumber(inputs.closingCostPct)); // decimal
  const dpaToDown        = nz(toNumber(inputs.dpaToDown));
  const dpaToCC          = nz(toNumber(inputs.dpaToCC));
  const sellerCredits    = nz(toNumber(inputs.sellerCredits));
  const otherCredits     = nz(toNumber(inputs.otherCredits));
  const earnest          = nz(toNumber(inputs.earnest));
  const includeEarnestInCTC = !!inputs.includeEarnestInCTC;
  const dpaCountsTowardCap   = !!inputs.dpaCountsTowardCap;

  // Base costs
  const baseDown = Math.max(0, nz(price * downPct));
  const baseCC   = Math.max(0, nz(price * closingCostPct));

  // Credits + DPA application
  const remainingDown = Math.max(0, nz(baseDown - dpaToDown));
  const remainingCC   = Math.max(0, nz(baseCC - dpaToCC - sellerCredits - otherCredits));

  // CTC
  const ctcBase = Math.max(0, nz(baseDown + baseCC));
  const ctcNet  = Math.max(0, nz(remainingDown + remainingCC - (includeEarnestInCTC ? earnest : 0)));

  // Commission displays (example numbers for UI context only)
  const grossCommission = Math.max(0, nz(price * 0.025 * 4)); // purely illustrative
  const agentShare = grossCommission * 0.5;
  const ahaShare   = grossCommission * 0.5;

  // Program caps & planned credits
  const buyerBonusProgramCap = Math.max(0, nz(price * 0.01)); // 1%
  const plannedAfc   = Math.max(0, nz(price * 0.00375));
  const plannedAha   = Math.max(0, nz(price * 0.00375));
  const plannedAgent = Math.max(0, nz(price * 0.0025));

  const dpaApplied = nz(dpaToCC + dpaToDown);
  const preCredits = Math.max(0, nz(sellerCredits) + nz(otherCredits) + (dpaCountsTowardCap ? dpaApplied : 0));

  // Cap targets based on remaining need
  const remainingNeed = Math.max(0, nz(ctcNet));
  const capTarget     = Math.max(0, nz(remainingNeed - preCredits));
  const capUsed       = Math.min(nz(buyerBonusProgramCap), nz(capTarget));

  // Allow planned credits up to capUsed in AFC -> AHA -> Agent order
  const allowedAfc    = Math.max(0, Math.min(nz(plannedAfc), nz(capUsed)));
  const allowedAha    = Math.max(0, Math.min(nz(plannedAha), nz(Math.max(0, capUsed - allowedAfc))));
  const allowedAgent  = Math.max(0, Math.min(nz(plannedAgent), nz(Math.max(0, capUsed - allowedAfc - allowedAha))));

  const agentNet = Math.max(0, nz(agentShare - allowedAgent));
  const ahaNet   = Math.max(0, nz(ahaShare - allowedAha));

  // Seller credits needed to zero the agent (agent contribution absorbed by credits)
  const creditsToZeroAgent      = Math.max(0, nz(capUsed - (plannedAfc + plannedAha)));
  const additionalCreditsToZeroAgent = Math.max(0, nz(creditsToZeroAgent - preCredits));

  return {
    price, downPct, closingCostPct,
    baseDown, baseCC, remainingDown, remainingCC,
    ctcBase, ctcNet,
    grossCommission, agentShare, ahaShare,
    plannedAfc, plannedAha, plannedAgent,
    allowedAfc, allowedAha, allowedAgent,
    agentNet, ahaNet,
    buyerBonusProgramCap, capUsed,
    preCredits, remainingNeed,
    includeEarnestInCTC, dpaCountsTowardCap,
    creditsToZeroAgent, additionalCreditsToZeroAgent,
    capRule: "FHA: 6%"
  };
}
