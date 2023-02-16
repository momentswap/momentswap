import { ArrowLeftIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Comment, Layout, Moment, ThemeToggle } from "@components";
import { CommentData, MomentMetadata } from "@utils/definitions/interfaces";
import { useMomentSwap } from "src/hooks";
import { getCommentsByMomentId } from "src/mock/data";

export default function MomentPage() {
  const router = useRouter();
  const { getNFTCollection } = useMomentSwap();
  const [moment, setMoment] = useState<MomentMetadata | undefined>(undefined);
  const [comments, setComments] = useState<Array<CommentData>>([]);
  const momentId = router.query.id as string;

  useEffect(() => {
    setComments(getCommentsByMomentId(momentId) || []);
  }, [momentId]);

  useEffect(() => {
    (async () => {
      const collection = await getNFTCollection();

      if (collection) {
        const itemId = collection.findIndex((item) => item[2].toString() === momentId);
        const item = collection[itemId];

        const _moment: MomentMetadata = {
          address: item[0],
          id: item[2].toString(),
          timestamp: item[3].toNumber(),
          metadataURL: `https://${item[1].split("/")[2]}.ipfs.dweb.link/metadata.json`,
        };
        const metadata = await fetch(_moment.metadataURL).then((res) => res.json());
        _moment.contentText = metadata.properties.content["text/markdown"];
        _moment.media = `https://${metadata.properties.media.cid}.ipfs.dweb.link`;
        _moment.mediaType = metadata.properties.media.type;
        setMoment(_moment);
      }
    })();
  }, [momentId]);

  return (
    <>
      <Layout>
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
          {moment && <Moment moment={moment} />}
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
                  <Comment key={comment.id} comment={comment} originalPostId={momentId} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </Layout>
    </>
  );
}
