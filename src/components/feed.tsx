import { Loader, Moment, ThemeToggle } from "@components";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { useMomentSwapContract, useSpaceFNSContract } from "@hooks";
import { MomentMetadata } from "@utils/definitions/interfaces";
import { collectionToMoments } from "@utils/helpers/collection-to-moments";
import { searchKeyState } from "src/atom";

export const Feed = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [moments, setMoments] = useState<Array<MomentMetadata>>([]);
  const { getNFTCollection } = useMomentSwapContract();
  const [searchKey, setSearchKey] = useRecoilState(searchKeyState);
  const { getAllDomainByCreator, getAvatar } = useSpaceFNSContract();
  useEffect(() => {
    (async () => {
      setLoading(true);
      const collection = await getNFTCollection();

      const _moments = await collectionToMoments(collection);
      for (let m of _moments) {
        try {
          const [_mainDomain] = await getAllDomainByCreator(m.address);
          m.username = _mainDomain;

          const _avatarUrl = await getAvatar(m.address);
          m.userImg = _avatarUrl;
        } catch {
          m.username = "---";
        }
      }
      setMoments(_moments);
      setLoading(false);
    })();
  }, [getNFTCollection, getAvatar]);

  return (
    <div className="border-l border-r border-primary xl:min-w-[576px] flex-grow max-w-xl w-[100vw] h-[100%]">
      <div className="flex items-center justify-between p-2 sticky top-0 z-50 bg-base-200 border-primary">
        <h2 className="text-lg sm:text-xl font-bold cursor-pointer">Home</h2>
        <img src="/logo.png" alt="" className="h-8 w-8 sm:hidden" />
        <div className="flex items-center justify-center px-0 w-9 h-9">
          <ThemeToggle />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center h-[100%] items-center">
          <Loader />
        </div>
      ) : moments.length > 0 ? (
        <AnimatePresence>
          {moments.map((moment) => (
            <motion.div
              key={moment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <Moment key={moment.id} moment={moment} />
            </motion.div>
          ))}
        </AnimatePresence>
      ) : (
        <div className="flex justify-center h-[100%] items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <p>No records</p>
        </div>
      )}
    </div>
  );
};
