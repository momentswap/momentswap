import { CommentModal, IdentityModal, PublishModal, Sidebar, Widgets } from "@components";
import Head from "next/head";
import { FC, ReactNode } from "react";

import { useSpaceDomain, useWalletProvider } from "src/hooks";
import { Footbar } from "./footbar";

type Props = {
  children?: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  const { address, disconnect } = useWalletProvider();
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
            <div className="mb-12">{children}</div>
            <Widgets />
            <Footbar />
          </>
        ) : (
          <div className="flex flex-col h-screen w-screen justify-center items-center px-6 break-all">
            <p>
              Your wallet address: <span className="font-mono">{address}</span>
            </p>

            {loading ? (
              <p>From the chain during data loading...</p>
            ) : (
              <>
                <p>
                  The Space Domain needs to be registered for the first login:{" "}
                  <label htmlFor="identity-modal" className="link">
                    Register
                  </label>
                </p>

                <p>
                  Or{" "}
                  <span className="underline cursor-pointer" onClick={disconnect}>
                    Sign Out
                  </span>
                </p>
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
};
