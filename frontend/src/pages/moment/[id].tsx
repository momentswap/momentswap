import Comment, { CommentType } from "@components/comment";
import Sidebar from "@components/sidebar";
import Widgets from "@components/widgets";
import { ThemeToggle } from "@components/layout/theme-toggle";
import Moment, { PostType } from "@components/moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/outline";
import { mockMoments, getCommentsByMomentId } from "src/mock/data";
import CommentModal from "@components/comment-modal";
import SubmitModal from "@components/submit-modal";

export default function MomentPage({ newsResults, randomUsersResults }: any) {
  const router = useRouter();
  const [post, setPost] = useState<PostType>();
  const momentId = router.query.id as string;
  const [comments, setComments] = useState<Array<CommentType>>([]);

  useEffect(() => {
    setComments(getCommentsByMomentId(momentId) || []);
  }, [momentId]);

  useEffect(() => {
    const displayMomentId = mockMoments().findIndex((m) => m.id === momentId);
    setPost(mockMoments()[displayMomentId]);
  }, [momentId]);

  return (
    <>
      <main className="flex min-h-screen">
        <Sidebar />
        <div className="xl:ml-[370px] border-l border-r border-primary xl:min-w-[576px] sm:ml-[73px] flex-grow max-w-xl">
          <div className="flex py-2 px-3 sticky top-0 z-50 bg-base-200 border-primary">
            <div className="hoverEffect" onClick={() => router.back()}>
              <ArrowLeftIcon className="rounded-full h-9 w-9 hoverEffect p-2 hover:bg-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold my-auto">Moment</h2>
            <div className="hoverEffect flex items-center justify-center px-0 ml-auto w-9 h-9">
              {/* <SparklesIcon className="h-5" /> */}
              <ThemeToggle />
            </div>
          </div>
          {post && <Moment post={post} />}
          {comments.length > 0 && (
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  <Comment
                    key={comment.id}
                    comment={comment}
                    originalPostId={momentId}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
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
