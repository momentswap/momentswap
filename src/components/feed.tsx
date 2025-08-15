import { Loader, Moment, ThemeToggle } from "@components";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import { useMomentSwapContract, useSpaceFNSContract, useWalletProvider } from "@hooks";
import { MomentMetadata } from "@utils/definitions/interfaces";
import { collectionToMoments } from "@utils/helpers/collection-to-moments";
import { searchKeyState } from "src/atom";

export const Feed = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [moments, setMoments] = useState<Array<MomentMetadata>>([]);
  const { getNFTCollection } = useMomentSwapContract();
  const [searchKey, setSearchKey] = useRecoilState(searchKeyState);
  const { getAllDomainByCreator, getAvatar } = useSpaceFNSContract();
  const { address, connect, providerError } = useWalletProvider(); // Add connect and providerError

  useEffect(() => {
    const fetchNFTData = async () => {
      if (!address) {
        console.log("Waiting for wallet connection...");
        return;
      }

      console.log("Wallet connected, starting to fetch NFTs:", address);
      setLoading(true);

      try {
        const collection = await getNFTCollection();
        console.log("Successfully fetched NFT collection:", collection);

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
      } catch (error) {
        console.error("Failed to fetch NFTs:", error);
        // Can add error handling here, such as displaying error messages
      } finally {
        setLoading(false);
      }
    };

    fetchNFTData();
  }, [getNFTCollection, getAvatar, address]); // Add address to dependency array

  // If wallet not connected, show connection prompt
  if (!address) {
    return (
      <div className="border-l border-r border-primary xl:min-w-[576px] flex-grow max-w-xl w-[100vw] h-[100%]">
        <div className="flex items-center justify-between p-2 sticky top-0 z-50 bg-base-200 border-primary">
          <h2 className="text-lg sm:text-xl font-bold cursor-pointer">Home</h2>
          <img src="/logo.png" alt="" className="h-8 w-8 sm:hidden" />
          <div className="flex items-center justify-center px-0 w-9 h-9">
            <ThemeToggle />
          </div>
        </div>
        <div className="flex justify-center h-[100%] items-center">
          <div className="text-center">
            {providerError ? (
              <div>
                <div className="mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 mx-auto text-error mb-2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <p className="text-error text-sm">{providerError}</p>
                </div>
                <button
                  onClick={connect}
                  className="btn btn-primary"
                >
                  Retry Connection
                </button>
              </div>
            ) : (
              <div>
                <Loader />
                <p className="mt-4 mb-4">Initializing wallet connection...</p>
                <button
                  onClick={connect}
                  className="btn btn-primary"
                >
                  Connect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

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
          <div className="text-center">
            <Loader />
            <p className="mt-4">Loading NFT collection...</p>
          </div>
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
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 mx-auto mb-2 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="text-gray-500">No NFT records found</p>
            <p className="text-sm text-gray-400 mt-2">
              Connected wallet: {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};