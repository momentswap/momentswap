import { Moment, ThemeToggle } from "@components";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { MomentMetadata } from "@utils/definitions/interfaces";
import { useMomentSwap } from "src/hooks";
import { useWalletProvider } from "src/hooks/use-wallet-provider";

export const Feed = () => {
  const [moments, setMoments] = useState<Array<MomentMetadata>>();
  const { provider } = useWalletProvider();
  const { getNFTCollection } = useMomentSwap();

  // Get collection from the contract when provider is updated.
  useEffect(() => {
    (async () => {
      const collection = await getNFTCollection();
      console.log("collection", collection);

      const cacheMoments = collection?.map<MomentMetadata>((item) => ({
        address: item[0],
        id: item[2].toString(),
        timestamp: item[3].toNumber(),
        metadataURL: `https://${item[1].split("/")[2]}.ipfs.dweb.link/metadata.json`,
      }));

      if (cacheMoments) {
        for (const m of cacheMoments) {
          const metadata = await fetch(m.metadataURL).then((res) => res.json());
          m.contentText = metadata.properties.content["text/markdown"];
          m.media = `https://${metadata.properties.media.cid}.ipfs.dweb.link`;
          m.mediaType = metadata.properties.media.type;
        }
      }

      setMoments(cacheMoments);
    })();
  }, [provider]);

  return (
    <div className="xl:ml-[370px] border-l border-r border-primary xl:min-w-[576px] sm:ml-[73px] flex-grow max-w-xl">
      <div className="flex py-2 px-3 sticky top-0 z-50 bg-base-200 border-primary">
        <h2 className="text-lg sm:text-xl font-bold cursor-pointer my-auto">Home</h2>
        <div className="hoverEffect flex items-center justify-center px-0 ml-auto w-9 h-9">
          {/* <SparklesIcon className="h-5" /> */}
          <ThemeToggle />
        </div>
      </div>
      <AnimatePresence>
        {moments?.map((moment) => (
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
    </div>
  );
};
