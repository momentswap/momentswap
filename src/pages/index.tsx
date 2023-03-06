import { Feed, Layout } from "@components";
import { useEffect } from "react";
import { useSpaceFNSContract, useWalletProvider } from "src/hooks";

export default function Home() {
  const { address } = useWalletProvider();
  const { getAllDomainByWallet } = useSpaceFNSContract();
  useEffect(() => {
    (async () => {
      if (address) {
        try {
          //   const [mainDomain] = await getAllDomainByWallet(address);
        } catch {}
      }
    })();
  }, [address]);
  return (
    <>
      <Layout>
        <Feed />
      </Layout>
    </>
  );
}
