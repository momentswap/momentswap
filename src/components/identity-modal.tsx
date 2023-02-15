import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { Avatar } from "@components";
import { useWalletProvider } from "src/hooks/use-wallet-provider";

export const IdentityModal = () => {
  const { address, signer } = useWalletProvider();
  const [text, setText] = useState<string | undefined>(undefined);
  const router = useRouter();
  const [userImg, setUserImg] = useState<string | undefined>(undefined);

  useEffect(() => {
    setText(localStorage.getItem("username") || undefined);
    setUserImg(localStorage.getItem("user-img") || undefined);
    document.getElementById("file-input")?.addEventListener("input", () => {
      //TODO: Upload avatar
      setUserImg("");
    });
  }, []);

  const saveIdentity = async () => {
    await signer?.signMessage("this is test");
    localStorage.setItem("username", text || "");
    localStorage.setItem("user-img", userImg || "");
    router.reload();
  };

  return (
    <>
      <input type="checkbox" id="identity-modal" className="modal-toggle" />
      <label htmlFor="identity-modal" className="modal cursor-pointer select-none">
        <label htmlFor="" className="modal-box px-14">
          <label htmlFor="identity-modal" className="btn btn-primary btn-sm btn-circle absolute right-2 top-2">
            ✕
          </label>
          <h3 className="font-bold text-lg">Edit Identity</h3>
          <div className="min-w-[300px] mt-5">
            <label htmlFor="file-input" className="inline-block">
              <div className="flex border-2 border-base-300 w-20 h-20 rounded-full overflow-hidden bg-opacity-20 bg-black hover:bg-opacity-25">
                <Avatar seed={address} image={userImg} diameter={77} className="rounded-full absolute -z-10" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8 m-auto rounded-full  text-zinc-300 bg-black bg-opacity-50 p-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
              </div>
            </label>
            <input id="file-input" hidden type="file" accept=".jpeg,.jpg,.png,.gif,image/*" />
            <input
              type="text"
              placeholder="Name"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input input-bordered w-1/2 mx-5"
            />{" "}
            <span className="font-semibold">.fil</span>
          </div>
          <div className="divider" />
          <div className="modal-action">
            <label htmlFor="identity-modal" className="btn btn-primary" onClick={saveIdentity}>
              Save
            </label>
          </div>
        </label>
      </label>
    </>
  );
};
