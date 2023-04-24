import { ContractTransaction } from "ethers";

export const zeroAddress = "0x0000000000000000000000000000000000000000";

export const calcGasFee = async (tx: ContractTransaction) => {
  return (await tx.wait()).gasUsed.mul(tx.gasPrice || 0);
};
