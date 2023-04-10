import { CommentModal, IdentityModal, PublishModal, Sidebar, SidebarMenuItem, Widgets } from "@components";
import Head from "next/head";
import { FC, ReactNode } from "react";
import { useSpaceDomain, useWalletProvider } from "src/hooks";
import { MbFootBar } from "./mbFootbar";


type Props = {
  children?: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  const { address } = useWalletProvider();
  const { mainDomain, loading } = useSpaceDomain();
  
  return (
    <>
      <CommentModal />
      <PublishModal />
      <IdentityModal />

      <Head>
        <title>MomentSwap</title>
        <meta
          name="description"
          content="Moments Swap is a social program where you can share text, pictures and videos. All shares posted on Moments Swap are by default an NFT, and other users can buy, rent your NFT shares. The purchaser owns the share and can then advertise on it or buy it from the next person. All advertising and NFT revenue will be transparently shared among ecological contributors, and the ecosystem has multiple ways to contribute and benefit."
        />
      </Head>
      <main className="flex min-h-screen">
        {mainDomain || address === undefined ? (
          <>
            <Sidebar />
            {children}
            <Widgets />
            <MbFootBar />
          </>
        ) : (
          <div className="flex flex-col h-screen w-screen justify-center items-center">
            <p>
              Your wallet address: <span className="font-mono">{address}</span>
            </p>

            {loading ? (
              <div>From the chain during data loading...</div>
            ) : (
              <div>
                The Space Domain needs to be registered for the first login:
                <label htmlFor="identity-modal" className="link">
                  Register
                </label>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
};
