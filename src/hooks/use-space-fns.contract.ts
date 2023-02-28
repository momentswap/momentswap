import { BigNumber, Contract } from "ethers";
import { useCallback, useMemo } from "react";

import FNSMarket from "@Contracts/FNSMarket.sol/RentMarket.json";
import { useWalletProvider } from "@hooks";

const contractAddress = process.env.NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS;
if (!contractAddress) {
  throw new Error("Please set NEXT_PUBLIC_SPACE_FNS_CONTRSCT_ADDRESS in a .env file");
}

export const useMomentSwap = () => {
  const { signer, provider } = useWalletProvider();
  const contractWithSigner = useMemo(() => new Contract(contractAddress, FNSMarket.abi, signer), [signer]);
  const contractWithProvider = useMemo(() => new Contract(contractAddress, FNSMarket.abi, provider), [provider]);

  // Read-only contract functions

  // Read-write contract functions

  const approve = useCallback(
    (to: string, tokenID: BigNumber): Promise<void> => {
      return contractWithProvider.approve(to, tokenID);
    },
    [contractWithProvider],
  );

  return {};
};
