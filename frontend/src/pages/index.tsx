import Head from "next/head";
import CommentModal from "@components/comment-modal";
import Feed from "@components/feed";
import Sidebar from "@components/sidebar";
import Widgets from "@components/widgets";
import SubmitModal from "@components/submit-modal";

export default function Home({ newsResults, randomUsersResults }: any) {
  return (
    <>
      <Head>
        <title>Moment Swap</title>
        <meta
          name="description"
          content="Moments Swap is a social program where you can share text, pictures and videos. All shares posted on Moments Swap are by default an NFT, and other users can buy, rent your NFT shares. The purchaser owns the share and can then advertise on it or buy it from the next person. All advertising and NFT revenue will be transparently shared among ecological contributors, and the ecosystem has multiple ways to contribute and benefit."
        />
      </Head>

      <main className="flex min-h-screen">
        <Sidebar />
        <Feed />
        <Widgets
          newsResults={newsResults?.articles}
          randomUsersResults={randomUsersResults?.results || null}
        />
        <CommentModal />
        <SubmitModal />
      </main>
    </>
  );
}
