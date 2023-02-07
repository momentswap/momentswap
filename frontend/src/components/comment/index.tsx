import { HeartIcon as HeartIconFilled } from "@heroicons/react/solid";
import Moment from "react-moment";
import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { modalState, postIdState } from "src/atom/modalAtom";
import { useRouter } from "next/router";
import { userState } from "src/atom/userAtom";
import { useWalletProvider } from "src/contexts/wallet-provider";
import { sortAddress } from "@utils/sort-address";

export type CommentType = {
  id?: string;
  name?: string;
  address?: string;
  userImg?: string;
  comment?: string;
  timestamp?: string;
};

type Props = {
  comment: CommentType;
  originalPostId: string;
};

export default function Comment({ comment, originalPostId }: Props) {
  const { connect, signerAddress } = useWalletProvider();
  const [likes, setLikes] = useState<Array<{ id: string }>>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [open, setOpen] = useRecoilState(modalState);
  const [postId, setPostId] = useRecoilState(postIdState);
  const router = useRouter();

  // async function likeComment() {
  //   if (signerAddress) {
  //   } else {
  //     connect();
  //   }
  // }

  // async function deleteComment() {
  //   if (window.confirm("Are you sure you want to delete this comment?")) {
  //     // deleteDoc(doc(db, "posts", originalPostId, "comments", commentId));
  //   }
  // }

  return (
    <div className="flex p-3 border-b border-primary pl-20">
      {/* user image */}
      <img
        className="h-11 w-11 rounded-full mr-4"
        src={comment?.userImg}
        alt="user-img"
      />
      {/* right side */}
      <div className="flex-1">
        {/* Header */}

        <div className="flex items-center justify-between">
          {/* post user info */}
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <h4 className="font-bold text-[15px] sm:text-[16px] hover:underline">
              {comment?.name}
            </h4>
            <span className="text-sm sm:text-[15px]">
              {sortAddress(comment?.address)} -{" "}
            </span>
            <span className="text-sm sm:text-[15px] hover:underline">
              <Moment fromNow>{comment?.timestamp}</Moment>
            </span>
          </div>

          {/* dot icon */}
        </div>

        {/* post text */}

        <p className="text-gray-800 text-[15px sm:text-[16px] mb-2">
          {comment?.comment}
        </p>

        {/* icons */}
        {/*
        <div className="flex justify-between text-gray-500 p-2">
          <div className="flex items-center select-none">
            <label htmlFor={signerAddress && "comment-modal"}>
              <ChatIcon
                onClick={() => {
                  if (signerAddress) {
                    setPostId(originalPostId);
                  } else {
                    connect();
                  }
                }}
                className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100"
              />
            </label>
          </div>
          {signerAddress === comment?.address && (
            <TrashIcon
              onClick={deleteComment}
              className=" rounded-fullh-9 w-9 hoverEffect p-2 hover:text-red-600 hover:bg-red-100"
            />
          )}
          <div className="flex items-center">
            {hasLiked ? (
              <HeartIconFilled
                onClick={likeComment}
                className=" rounded-fullh-9 w-9 hoverEffect p-2 text-red-600 hover:bg-red-100"
              />
            ) : (
              <HeartIcon
                onClick={likeComment}
                className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-red-600 hover:bg-red-100"
              />
            )}
            {likes.length > 0 && (
              <span
                className={`${hasLiked && "text-red-600"} text-sm select-none`}
              >
                {" "}
                {likes.length}
              </span>
            )}
          </div>

          <ShareIcon className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100" />
        </div> */}
      </div>
    </div>
  );
}
