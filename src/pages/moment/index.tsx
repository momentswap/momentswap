import { ArrowLeftIcon } from "@heroicons/react/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Comment, Layout, Moment, ThemeToggle } from "@components";
import { useMomentSwapContract, useSpaceFNSContract } from "@hooks";
import { CommentData, MomentMetadata } from "@utils/definitions/interfaces";
import { ipfsCidToHttpUrl } from "@utils/helpers/nftstorage";
import { extractCidFromMedia } from "@utils/helpers/media-utils";
import { getCommentsByMomentId } from "src/mock/data";

export default function MomentPage() {
  const router = useRouter();
  const { getNFTCollection } = useMomentSwapContract();
  const { getAllDomainByCreator, getAvatar } = useSpaceFNSContract();
  const [moment, setMoment] = useState<MomentMetadata | undefined>(undefined);
  const [comments, setComments] = useState<Array<CommentData>>([]);
  const momentId = router.query.id as string;

  useEffect(() => {
    setComments(getCommentsByMomentId(momentId) || []);
  }, [momentId]);

  useEffect(() => {
    (async () => {
      try {
        const collection = await getNFTCollection();

        if (!collection) {
          return;
        }

        const itemIndex = collection.findIndex((item) => item[2].toString() === momentId);
        const item = collection[itemIndex];

        if (!item) {
          console.error('Moment not found');
          return;
        }

        const [mainDomain] = await getAllDomainByCreator(item[0]);
        const avatar = await getAvatar(item[0]);

        const _moment: MomentMetadata = {
          address: item[0],
          id: item[2].toString(),
          timestamp: item[3].toNumber(),
          username: mainDomain,
          userImg: avatar,
          metadataURL: item[1],
        };

        const metadata = await fetch(_moment.metadataURL).then((res) => res.json());
        _moment.contentText = metadata.properties.content["text/markdown"];

        const actualCid = extractCidFromMedia(metadata.properties.media?.cid);
        if (actualCid) {
          _moment.media = await ipfsCidToHttpUrl(actualCid);
          _moment.mediaType = metadata.properties.media.type;
        }

        setMoment(_moment);
      } catch (error) {
        console.error('Failed to load moment:', error);
      }
    })();
  }, [getNFTCollection, momentId, getAllDomainByCreator, getAvatar]);

  return (
    <>
      <Layout>
        <div className="border-l border-r border-primary xl:min-w-[576px] flex-grow max-w-xl w-[100vw] h-[100%]">
          <div className="flex p-2 sticky top-0 z-50 bg-base-200 border-primary gap-2">
            <div onClick={() => router.back()}>
              <ArrowLeftIcon className="rounded-full h-9 w-9 p-2 hover:bg-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold my-auto">Moment</h2>
            <div className="flex items-center justify-center px-0 ml-auto w-9 h-9">
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
                  <Comment key={comment.id} comment={comment} originalMomentId={momentId} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </Layout>
    </>
  );
}