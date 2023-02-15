import { XIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { Media } from "@utils/definitions/interfaces";
import { createMomentSwapMetadata, storeMediaToIPFS, storeMetadataToIPFS } from "@utils/helpers";
import { useMomentSwap } from "src/hooks";
import { useWalletProvider } from "src/hooks/use-wallet-provider";

export const PublishModal = () => {
  const router = useRouter();
  const { address } = useWalletProvider();
  const { mintMomentSwapNFT } = useMomentSwap();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<Media | undefined>(undefined);
  const uploadInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length == 0 || loading) {
      return;
    }
    const file = e.target.files && e.target.files[0];
    setLoading(true);
    if (file) {
      try {
        const { mediaCID, mediaType } = await storeMediaToIPFS(file);
        setMedia({ url: `https://${mediaCID}.ipfs.dweb.link`, type: mediaType, cid: mediaCID });
      } catch (err) {
        console.error("Failed to store media.");
        alert("Failed to store media, please try again.");
      }
    }
    setLoading(false);
  };

  const publishHandler = async () => {
    if (!address) return;
    const metadata = createMomentSwapMetadata(address, text, media);

    try {
      const metadataIPFS = await storeMetadataToIPFS(metadata);
      await mintMomentSwapNFT(address, metadataIPFS || "");
      alert("Successfully published moment!");
      router.reload();
    } catch (err) {
      console.error("Failed to publish moment, error:", err);
      alert("Failed to publish moment.");
    }
  };

  const cleanFileInput = () => {
    // TODO: Reset "file-input" selected file.
    setMedia(undefined);
  };

  return (
    <>
      <input type="checkbox" id="publish-modal" className="modal-toggle" />
      <label htmlFor="publish-modal" className="modal cursor-pointer select-none">
        <label htmlFor="" className="modal-box px-14">
          <label htmlFor="publish-modal" className="btn btn-primary btn-sm btn-circle absolute right-2 top-2">
            ✕
          </label>
          <h3 className="font-bold text-lg">Record your moments!</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            className="textarea textarea-bordered w-full mt-5"
            placeholder="Just say something."
          />

          <div
            className={`relative min-h-16 rounded-2xl overflow-hidden ${!media && !loading && "hidden"} ${
              loading && "animate-pulse bg-base-300"
            }`}
          >
            <XIcon
              onClick={cleanFileInput}
              className="border h-7 z-50 m-1 absolute right-2 top-2 cursor-pointer shadow-md bg-white text-gray-500 rounded-full"
            />
            {/^image/.test(media?.type || "unknow") ? (
              <img src={media?.url} alt="moment-media" />
            ) : /^video/.test(media?.type || "unknow") ? (
              <video controls disablePictureInPicture src={media?.url} />
            ) : null}
          </div>

          <div className="divider" />

          {/* Media Uploader */}

          <label
            htmlFor="file-input"
            className="inline-block p-1 hover:bg-primary rounded-full active:bg-primary-focus"
          >
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
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </label>
          <input
            id="file-input"
            hidden
            type="file"
            accept=".jpeg,.jpg,.png,.gif,image/*,video/mp4,video/webm,video/ogg"
            onChange={uploadInput}
          />

          <div className="modal-action">
            <label
              htmlFor="publish-modal"
              className={`btn btn-primary ${loading && "pointer-events-none saturate-0"}`}
              onClick={publishHandler}
            >
              Publish
            </label>
          </div>
        </label>
      </label>
    </>
  );
};
