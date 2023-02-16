import { Avatar, Layout, ThemeToggle } from "@components";

import { ArrowLeftIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useWalletProvider } from "src/hooks/use-wallet-provider";

export default function UserPage() {
  const router = useRouter();
  const { address } = useWalletProvider();
  const pageAddress = router.query.address as string;
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [userImg, setUserImg] = useState<string | undefined>(undefined);
  useEffect(() => {
    setUsername(localStorage.getItem("username") || undefined);
    setUserImg(localStorage.getItem("user-img") || undefined);
  }, []);
  return (
    <>
      <Layout>
        <div className="xl:ml-[370px] border-l border-r border-primary xl:min-w-[576px] sm:ml-[73px] flex-grow max-w-xl">
          <div className="flex py-2 px-3 sticky top-0 z-50 bg-base-200 border-primary">
            <div className="hoverEffect" onClick={() => router.back()}>
              <ArrowLeftIcon className="rounded-full h-9 w-9 hoverEffect p-2 hover:bg-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold my-auto">{username || "Profile"}</h2>
            <div className="hoverEffect flex items-center justify-center px-0 ml-auto w-9 h-9">
              {/* <SparklesIcon className="h-5" /> */}
              <ThemeToggle />
            </div>
          </div>
          {/* Head  */}
          <div className="w-full h-[160px] bg-gradient-to-r from-secondary to-neutral mb-16">
            <div></div>
            <Avatar seed={address} image={userImg} diameter={100} className="rounded-full relative top-28 left-8" />
          </div>
          {/* Body */}

          <label
            htmlFor="identity-modal"
            className={`btn btn-primary btn-sm btn-outline gap-2 float-right mr-6 ${
              address !== pageAddress && "hidden"
            }`}
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
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Edit Identity
          </label>
          <div className="mx-6">
            <p className="text-2xl font-semibold">{username || "---"}.fil</p>
            <p className="text-sm">{address}</p>
          </div>
          <div className="mt-5">
            <div className="tabs">
              <a className="tab tab-bordered w-1/3 font-semibold tab-active">Moments</a>
              <a className="tab tab-bordered w-1/3 font-semibold">Likes</a>
              <a className="tab tab-bordered w-1/3 font-semibold">Space DN</a>
            </div>
            <p>coming soon...</p>
          </div>
        </div>
      </Layout>
    </>
  );
}
