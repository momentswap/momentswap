import { useRouter } from "next/router";
import { useState } from "react";
import { useRecoilState } from "recoil";

import { momentIdState } from "src/atom";
import { useWalletProvider } from "src/hooks/use-wallet-provider";
import { postComment } from "src/mock/data";

export const CommentModal = () => {
  const { address, signer } = useWalletProvider();
  const [momentId] = useRecoilState(momentIdState);
  const [text, setText] = useState("");
  const router = useRouter();

  async function commentHandler() {
    await signer?.signMessage("this is test");
    postComment(momentId, {
      username: "name",
      address,
      userImg: "https://t7.baidu.com/it/u=839828294,1619278046&fm=193&f=GIF",
      comment: text,
    });
    setText("");
    if (router.pathname.indexOf("/moment") >= 0) {
      router.reload();
    } else {
      router.push(`/moment/${momentId}`);
    }
  }

  return (
    <div>
      <input type="checkbox" id="comment-modal" className="modal-toggle" />
      <label htmlFor="comment-modal" className="modal cursor-pointer select-none">
        <label htmlFor="" className="modal-box px-14">
          <label htmlFor="comment-modal" className="btn btn-primary btn-sm btn-circle absolute right-2 top-2">
            ✕
          </label>
          <h3 className="font-bold text-lg">Comment</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            className="textarea textarea-bordered w-full mt-5"
            placeholder="Just say something."
          />
          <div className="divider" />
          <div className="modal-action">
            <label htmlFor="comment-modal" className="btn btn-primary" onClick={commentHandler}>
              Post
            </label>
          </div>
        </label>
      </label>
    </div>
  );
};
