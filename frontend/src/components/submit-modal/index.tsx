import { XIcon } from "@heroicons/react/outline";
import React, { useState, useRef } from "react";
import { useWalletProvider } from "src/contexts/wallet-provider";

export default function Submit() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<{
    url?: string;
    type?: string;
  } | null>(null);
  const { connect, disconnect, signerAddress } = useWalletProvider();
  const uploadMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length == 0 || loading) {
      return;
    }
    const file = e.target.files && e.target.files[0];

    setLoading(true);
    setMedia({
      url: "https://t7.baidu.com/it/u=839828294,1619278046&fm=193&f=GIF",
      type: file?.type.split("/")[0],
    });
    setLoading(false);
  };

  const submitHandle = () => {
    if (loading) {
      return;
    }

    setText("");
    setMedia(null);
  };

  return (
    <>
      <input type="checkbox" id="submit-modal" className="modal-toggle" />
      <label
        htmlFor="submit-modal"
        className="modal cursor-pointer select-none"
      >
        <label htmlFor="" className="modal-box px-14">
          <label
            htmlFor="submit-modal"
            className="btn btn-primary btn-sm btn-circle absolute right-2 top-2"
          >
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

          {media && (
            <div className="relative">
              <XIcon
                onClick={() => setMedia(null)}
                className="border h-7 text-gray-500 absolute right-2 top-2 cursor-pointer shadow-md bg-white m-1 rounded-full"
              />
              <img
                alt="post-media"
                src={media.url}
                className={`${loading && "animate-pulse"}`}
              />
            </div>
          )}

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
            onChange={uploadMedia}
          />

          <div className="modal-action">
            <label
              htmlFor="submit-modal"
              className={`btn btn-primary ${
                loading && "pointer-events-none saturate-0"
              }`}
              onClick={submitHandle}
            >
              Submit
            </label>
          </div>
        </label>
      </label>
    </>
  );
}
