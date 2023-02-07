import {
  ChartBarIcon,
  ChatIcon,
  DotsHorizontalIcon,
  HeartIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { HeartIcon as HeartIconFilled } from "@heroicons/react/solid";
import Moment from "react-moment";

import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { modalState, postIdState } from "src/atom/modalAtom";
import { useRouter } from "next/router";
import { userState } from "src/atom/userAtom";
import { useWalletProvider } from "src/contexts/wallet-provider";
import {
  getCommentsByMomentId,
  getLikesByMomentId,
  storeLikes,
} from "src/mock/data";
import { CommentType } from "@components/comment";

type MediaType = "video" | "image";

export type PostType = {
  id: string;
  address: string;
  timestamp: string;
  text: string;
  userImg?: string;
  username?: string;
  media?: string;
  mediaType?: MediaType;
};

type Props = {
  post: PostType;
};

export default function Post({ post }: Props) {
  const { connect, signerAddress } = useWalletProvider();
  const [likes, setLikes] = useState<Array<string>>([]);
  const [comments, setComments] = useState<Array<CommentType>>([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [postId, setPostId] = useRecoilState(postIdState);
  const [currentUser] = useRecoilState(userState);
  const router = useRouter();
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    setComments(getCommentsByMomentId(post.id) || []);
    const localLikes = getLikesByMomentId(post.id);
    setLikes(localLikes);
    setHasLiked(localLikes?.includes(post?.username || ""));
  }, [post]);

  async function likePost() {
    if (signerAddress) {
      storeLikes(post.id, post.username || "");
      const localLikes = getLikesByMomentId(post.id);
      setLikes(localLikes);
      setHasLiked(localLikes?.includes(post?.username || ""));
    } else {
      connect();
    }
  }

  async function deletePost() {
    if (window.confirm("Are you sure you want to delete this post?")) {
      router.push("/");
    }
  }

  return (
    <div className="flex p-3 border-b border-primar">
      {/* user image */}
      <img
        className="h-11 w-11 rounded-full mr-4 cursor-pointer"
        src={post?.userImg}
        alt="user-img"
        onClick={() => router.push(`/user/${post.username}`)}
      />
      {/* right side */}
      <div className="flex-1">
        {/* Header */}

        <div className="flex items-center justify-between">
          {/* post user info */}
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <h4
              className=" font-bold text-[15px] sm:text-[16px] hover:underline cur"
              onClick={() => router.push(`/user/${post.username}`)}
            >
              {post?.username}
            </h4>
            <span className="text-sm sm:text-[15px] text-gray-500">
              {`${post?.address.slice(0, 5)}...${post?.address.slice(-3)}`} -{" "}
              <Moment fromNow>{post?.timestamp}</Moment>
            </span>
          </div>

          {/* dot icon */}
          {/* <DotsHorizontalIcon className="h-10 hoverEffect w-10 hover:bg-primary hover:text-primary-content p-2 " /> */}
        </div>
        <div
          onClick={() => router.push(`/moment/${post.id}`)}
          className="cursor-pointer"
        >
          {/* post text */}

          <p className="text-[15px sm:text-[16px] mb-2">{post?.text}</p>

          {/* post media */}

          {post?.media &&
            (post?.mediaType === "image" ? (
              <img
                className="rounded-2xl mr-2"
                src={post.media}
                alt="post-media"
                onClick={() => setPreview(true)}
              />
            ) : post?.mediaType === "video" ? (
              <video
                controls
                disablePictureInPicture
                className="rounded-2xl mr-2"
                src={post.media}
              />
            ) : null)}
        </div>
        {/* icons */}

        <div className="flex justify-between p-2">
          <div className="flex items-center select-none">
            <label htmlFor={signerAddress && "comment-modal"}>
              <ChatIcon
                onClick={() => {
                  if (signerAddress) {
                    setPostId(post.id);
                  } else {
                    connect();
                  }
                }}
                className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100"
              />
            </label>
            {comments.length > 0 && (
              <span className="text-sm">{comments.length}</span>
            )}
          </div>
          <div className="flex items-center">
            {hasLiked ? (
              <HeartIconFilled
                onClick={likePost}
                className="rounded-full h-9 w-9 hoverEffect p-2  text-rose-400 hover:bg-rose-100"
              />
            ) : (
              <HeartIcon
                onClick={likePost}
                className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-rose-400 hover:bg-rose-100"
              />
            )}
            {likes?.length > 0 && (
              <span
                className={`${hasLiked && "text-red-600"} text-sm select-none`}
              >
                {" "}
                {likes.length}
              </span>
            )}
            {currentUser?.uid === post?.id && (
              <TrashIcon
                onClick={deletePost}
                className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-red-600 hover:bg-red-100"
              />
            )}
          </div>

          <ShareIcon className="rounded-full h-9 w-9 hoverEffect p-2 hover:text-sky-500 hover:bg-sky-100" />
        </div>
      </div>
    </div>
  );
}
