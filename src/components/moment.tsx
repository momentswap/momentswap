import { ChatIcon, HeartIcon, ShareIcon } from "@heroicons/react/outline";
import { HeartIcon as HeartIconFilled } from "@heroicons/react/solid";
import momenttools from "moment";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import RMoment from "react-moment";
import { useRecoilState } from "recoil";

import { useWalletProvider } from "@hooks";
import { CommentData, MomentMetadata } from "@utils/definitions/interfaces";
import { sortAddress } from "@utils/helpers";
import { momentIdState } from "src/atom";
import { getCommentsByMomentId, getLikesByMomentId, storeLikes } from "src/mock/data";
import { Avatar } from "./avatar";
import { useChainList } from "src/hooks/use-chain-list";

type Props = {
  moment: MomentMetadata;
};

export const Moment = ({ moment }: Props) => {
  const { connect, address, signer } = useWalletProvider();
  const [likes, setLikes] = useState<Array<string>>([]);
  const [comments, setComments] = useState<Array<CommentData>>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [momentId, setMomentId] = useRecoilState(momentIdState);
  const router = useRouter();
  const chainList = useChainList(s=>s.TYPE)

  useEffect(() => {
    setComments(getCommentsByMomentId(moment?.id) || []);
    const localLikes = getLikesByMomentId(moment?.id);
    setLikes(localLikes);
    setHasLiked(localLikes?.includes(moment?.username || ""));
  }, [moment]);

  async function likeMoment() {
    alert("coming soon!");
    return;
    if (address) {
      await signer?.signMessage("this is test");
      storeLikes(moment.id, moment.username || "");
      const localLikes = getLikesByMomentId(moment.id);
      setLikes(localLikes);
      setHasLiked(localLikes?.includes(moment?.username || ""));
    } else {
      connect();
    }
  }

  async function deleteMoment() {
    if (window.confirm("Are you sure you want to delete this moment?")) {
      await signer?.signMessage("this is test");
      localStorage.setItem("submit", "0");
      router.reload();
    }
  }

  return (
    <div className="flex p-3 border-b border-primary">
      {/* user image */}

      <Avatar
        seed={moment?.address}
        image={moment?.userImg}
        diameter={38}
        className="items-center mr-4 cursor-pointer"
        onClick={() => router.push(`/user?address=${moment.address}`)}
      />
      {/* right side */}
      <div className="flex-1">
        {/* Header */}

        <div className="flex items-center justify-between">
          {/* moment user info */}
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <h4 className="font-bold text-[15px] sm:text-[16px]">{moment?.username || "---"}{chainList==="FIL"? ".fil":".aleo"}</h4>
            <p className="text-sm sm:text-[15px] text-gray-500">
              <span
                className="hover:underline cursor-pointer"
                onClick={() => router.push(`/user?address=${moment.address}`)}
              >
                {sortAddress(moment?.address, 6)}{" "}
              </span>
              - <RMoment fromNow>{momenttools.unix(moment?.timestamp)}</RMoment>
            </p>
          </div>

          {/* dot icon */}
          {/* <DotsHorizontalIcon className="h-10 hoverEffect w-10 hover:bg-primary hover:text-primary-content p-2 " /> */}
        </div>
        <div onClick={() => router.push(`/moment?id=${moment.id}`)} className="cursor-pointer">
          {/* moment text */}

          <p className="text-[15px sm:text-[16px] mb-2">{moment?.contentText}</p>

          {/* moment media */}

          {moment?.media &&
            (/^image/.test(moment?.mediaType || "unknow") ? (
              <img className="rounded-2xl mr-2" src={moment.media} alt="moment-media" />
            ) : /^video/.test(moment?.mediaType || "unknow") ? (
              <video controls disablePictureInPicture className="rounded-2xl mr-2" src={moment.media} />
            ) : null)}
        </div>
        {/* icons */}

        <div className="flex justify-between p-2">
          <div className="flex items-center select-none">
            {/* TODO: Waiting for contract implementation */}
            {/* <label htmlFor={address && "comment-modal"}> */}
            <label onClick={() => alert("coming soon!")}>
              <ChatIcon
                onClick={() => {
                  if (address) {
                    setMomentId(moment.id);
                  } else {
                    connect();
                  }
                }}
                className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100"
              />
            </label>
            {comments.length > 0 && <span className="text-sm">{comments.length}</span>}
          </div>
          <div className="flex items-center">
            {hasLiked ? (
              <HeartIconFilled
                onClick={likeMoment}
                className="rounded-full h-9 w-9 hoverEffect p-2  text-rose-400 hover:bg-rose-100"
              />
            ) : (
              <HeartIcon
                onClick={likeMoment}
                className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-rose-400 hover:bg-rose-100"
              />
            )}
            {likes?.length > 0 && (
              <span className={`${hasLiked && "text-red-600"} text-sm select-none`}> {likes.length}</span>
            )}
          </div>
          {/* {address === moment?.address && (
            <TrashIcon
              onClick={deleteMoment}
              className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-red-600 hover:bg-red-100"
            />
          )} */}
          <ShareIcon
            onClick={() => alert("coming soon!")}
            className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100"
          />
        </div>
      </div>
    </div>
  );
};
