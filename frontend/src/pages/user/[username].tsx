import Sidebar from "@components/sidebar";
import Widgets from "@components/widgets";
import { ThemeToggle } from "@components/layout/theme-toggle";
import Moment, { PostType } from "@components/moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import CommentModal from "@components/comment-modal";
import SubmitModal from "@components/submit-modal";
import { Avatar } from "@components/account/avatar";

export default function MomentPage({ newsResults, randomUsersResults }: any) {
  const router = useRouter();
  const [post, setPost] = useState<PostType>();
  const username = router.query.username as string;

  return (
    <>
      <main className="flex min-h-screen">
        <Sidebar />
        <div className="xl:ml-[370px] border-l border-r border-primary xl:min-w-[576px] sm:ml-[73px] flex-grow max-w-xl">
          <div className="flex py-2 px-3 sticky top-0 z-50 bg-base-200 border-primary">
            <div className="hoverEffect" onClick={() => router.back()}>
              <ArrowLeftIcon className="rounded-full h-9 w-9 hoverEffect p-2 hover:bg-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold my-auto">{username}</h2>
            <div className="hoverEffect flex items-center justify-center px-0 ml-auto w-9 h-9">
              {/* <SparklesIcon className="h-5" /> */}
              <ThemeToggle />
            </div>
          </div>
          {/* Head  */}
          <div className="w-full h-[160px] bg-gradient-to-r from-secondary to-neutral"></div>
          <Avatar diameter={56} />
        </div>

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
