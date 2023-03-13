import { Feed, Layout } from "@components";
import { useSpaceDomain, useWalletProvider } from "src/hooks";

export default function Home() {
  const { address } = useWalletProvider();
  const { mainDomain, loading } = useSpaceDomain();

  return (
    <>
      <Layout>
        <Feed />
      </Layout>
    </>
  );
}
