export function calculateCommissionSplit(amount: number, coAgentCount: number) {
  if (coAgentCount === 0) {
    return {
      websiteFee: Math.round(amount * 0.10),
      agentAmount: Math.round(amount * 0.90),
      coAgentAmount: 0,
      coAgentAmountPerPerson: 0,
      coAgentCount: 0
    };
  } else {
    const totalCoAgentAmount = Math.round(amount * 0.20);
    const coAgentAmountPerPerson = Math.round(totalCoAgentAmount / coAgentCount);
    return {
      websiteFee: Math.round(amount * 0.10),
      agentAmount: Math.round(amount * 0.70),
      coAgentAmount: totalCoAgentAmount,
      coAgentAmountPerPerson,
      coAgentCount
    };
  }
}
