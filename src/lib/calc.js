export const toNumber = (v)=>{
  const n = Number((v??'').toString().replace(/[^0-9.\-]/g,''));
  return Number.isFinite(n)? n : 0;
};
const nz = v => (Number(v)||0);

// Simplified program math with NaN guards throughout
export function compute(inputs){
  const price            = nz(toNumber(inputs.price));
  const downPct          = nz(toNumber(inputs.downPct));       // e.g. 0.02 for 2%
  const closingCostPct   = nz(toNumber(inputs.closingCostPct));// e.g. 0.03 for 3%
  const dpaToDown        = nz(toNumber(inputs.dpaToDown));
  const dpaToCC          = nz(toNumber(inputs.dpaToCC));
  const sellerCredits    = nz(toNumber(inputs.sellerCredits));
  const otherCredits     = nz(toNumber(inputs.otherCredits));
  const earnest          = nz(toNumber(inputs.earnest));
  const includeEarnestInCTC = !!inputs.includeEarnestInCTC;
  const dpaCountsTowardCap   = !!inputs.dpaCountsTowardCap;

  const baseDown = Math.max(0, nz(price * downPct));
  const baseCC   = Math.max(0, nz(price * closingCostPct));

  const remainingDown = Math.max(0, nz(baseDown - dpaToDown));
  const remainingCC   = Math.max(0, nz(baseCC - dpaToCC - sellerCredits - otherCredits));

  const ctcBase = Math.max(0, nz(baseDown + baseCC));
  const ctcNet  = Math.max(0, nz(remainingDown + remainingCC - (includeEarnestInCTC ? earnest : 0)));

  // Program cap at 1% of price; planned splits
  const buyerBonusProgramCap = Math.max(0, nz(price * 0.01));
  const plannedAfc   = Math.max(0, nz(price * 0.00375));
  const plannedAha   = Math.max(0, nz(price * 0.00375));
  const plannedAgent = Math.max(0, nz(price * 0.0025));

  const dpaApplied = nz(dpaToCC + dpaToDown);
  const preCredits = Math.max(0, nz(sellerCredits) + nz(otherCredits) + (dpaCountsTowardCap ? dpaApplied : 0));

  const remainingNeed = Math.max(0, nz(ctcNet));
  const capTarget     = Math.max(0, nz(remainingNeed - preCredits));
  const capUsed       = Math.min(nz(buyerBonusProgramCap), nz(capTarget));

  const allowedAfc    = Math.max(0, Math.min(nz(plannedAfc), nz(capUsed)));
  const allowedAha    = Math.max(0, Math.min(nz(plannedAha), nz(Math.max(0, capUsed - allowedAfc))));
  const allowedAgent  = Math.max(0, Math.min(nz(plannedAgent), nz(Math.max(0, capUsed - allowedAfc - allowedAha))));

  const creditsToZeroAgent      = Math.max(0, nz(capUsed - (plannedAfc + plannedAha)));
  const additionalCreditsToZeroAgent = Math.max(0, nz(creditsToZeroAgent - preCredits));

  return {
    price, downPct, closingCostPct,
    baseDown, baseCC, remainingDown, remainingCC,
    ctcBase, ctcNet,
    buyerBonusProgramCap, capUsed,
    plannedAfc, plannedAha, plannedAgent,
    allowedAfc, allowedAha, allowedAgent,
    preCredits, remainingNeed,
    creditsToZeroAgent, additionalCreditsToZeroAgent
  };
}
