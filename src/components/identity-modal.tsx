import { useEffect, useRef, useState } from "react";

import { Avatar } from "@components";
import { useSpaceDomain, useSpaceFNSContract, useWalletProvider } from "@hooks";
import { storeMediaToIPFS } from "@utils/helpers";
import { useRouter } from "next/router";

export const IdentityModal = () => {
  const { address } = useWalletProvider();
  const { registerMainDomain } = useSpaceFNSContract();
  const [text, setText] = useState("");
  const { mainDomain } = useSpaceDomain();
  const [userImg, setUserImg] = useState<string | undefined>(undefined);
  const avatarRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUserImg(localStorage.getItem("user-img") || "");

    avatarRef.current?.addEventListener("input", async () => {
      if (!avatarRef.current?.files || avatarRef.current.files.length === 0) return;
      const file = avatarRef.current.files[0];
      setLoading(true);
      const { mediaCID } = await storeMediaToIPFS(file);
      const avatarURL = `https://${mediaCID}.ipfs.dweb.link`;
      setUserImg(avatarURL);
      localStorage.setItem("user-img", avatarURL);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    setText(mainDomain);
  }, [mainDomain]);

  const saveIdentity = async () => {
    localStorage.setItem("user-img", userImg || "");
    if (!mainDomain) {
      setLoading(true);
      try {
        await (await registerMainDomain(text)).wait();
      } catch {}
      setLoading(false);
    }
    router.push("/");
  };

  return (
    <>
      <input type="checkbox" id="identity-modal" className="modal-toggle" />
      <label htmlFor="identity-modal" className="modal cursor-pointer select-none">
        <label htmlFor="" className="modal-box px-14">
          <label htmlFor="identity-modal" className="btn btn-primary btn-sm btn-circle absolute right-2 top-2">
            ✕
          </label>

          <h3 className="font-bold text-lg">Register Profile</h3>
          <div className="flex min-w-[300px] mt-5 items-center gap-5">
            <label htmlFor="avatar-input" className="inline-block">
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
            <input ref={avatarRef} id="avatar-input" hidden type="file" accept=".jpeg,.jpg,.png,.gif,image/*" />
            <input
              type="text"
              placeholder="Name"
              value={text}
              disabled={!!mainDomain}
              onChange={(e) => setText(e.target.value)}
              className="input input-bordered w-1/2"
            />
            <span className="font-semibold">.fil</span>
          </div>
          <div className="divider" />
          <div className="modal-action">
            <div className={`btn btn-primary ${loading ? "loading" : ""}`} onClick={saveIdentity}>
              Save
            </div>
          </div>
        </label>
      </label>
    </>
  );
};
