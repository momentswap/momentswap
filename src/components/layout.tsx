import { CommentModal, IdentityModal, PublishModal, Sidebar, Widgets } from "@components";
import Head from "next/head";
import { FC, ReactNode } from "react";

type Props = {
  children?: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Head>
        <title>MomentSwap</title>
        <meta
          name="description"
          content="Moments Swap is a social program where you can share text, pictures and videos. All shares posted on Moments Swap are by default an NFT, and other users can buy, rent your NFT shares. The purchaser owns the share and can then advertise on it or buy it from the next person. All advertising and NFT revenue will be transparently shared among ecological contributors, and the ecosystem has multiple ways to contribute and benefit."
        />
      </Head>
      <main className="flex min-h-screen">
        <Sidebar />
        {children}
        <Widgets />
        <CommentModal />
        <PublishModal />
        <IdentityModal />
      </main>
    </>
  );
};
