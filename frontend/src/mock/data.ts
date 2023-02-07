import { CommentType } from "@components/comment";
import { PostType } from "@components/moment";
import { id } from "ethers/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MomentProps } from "react-moment";

export const mockMoments = (): Array<PostType> => {
  return [
    {
      id: "1",
      address: "0xa0316faA558AEb07a5B8497ef5fB05d528132E59",
      userImg: "https://t7.baidu.com/it/u=839828294,1619278046&fm=193&f=GIF",
      username: "momentuser",
      timestamp: "2023/2/2 10:10",
      text: "Hi, Moment Swap",
      media: "https://t7.baidu.com/it/u=839828294,1619278046&fm=193&f=GIF",
      mediaType: "image",
    },
    {
      id: "2",
      address: "0xa0316faA558AEb07a5B8497ef5fB05d528132E59",
      userImg: "https://t7.baidu.com/it/u=839828294,1619278046&fm=193&f=GIF",
      username: "username1",
      timestamp: "2023/2/2 10:10",
      text: "Hi, Moment Swap",
      media:
        "https://www.f5.com/content/dam/f5-labs-v2/media-files/video/Happy%20Cow.mp4",
      mediaType: "video",
    },
    {
      id: "3",
      address: "0xa0316faA558AEb07a5B8497ef5fB05d528132E59",
      userImg: "https://t7.baidu.com/it/u=839828294,1619278046&fm=193&f=GIF",
      username: "username2",
      timestamp: "2023/2/2 10:10",
      text: "The rise of global social network giants has empowered the centralized tech cartels to misuse user data, infringe on user privacy and impose censorship. As reported after the investigation by Cambridge Analytica, Facebook collected social graphs and personal profiles from millions of users without their consent, with the end goal of fueling more directed political advertising and inappropriately profiting from the personal data of their users. The current landscape of web2, filled with centralized social networks, has deviated from the principle of the World Wide Web. Namely: to enable the decentralization of information on a large scale.",
    },
    {
      id: "4",
      address: "0xa0316faA558AEb07a5B8497ef5fB05d528132E59",
      userImg: "https://t7.baidu.com/it/u=2799580300,2163389035&fm=193&f=GIF",
      username: "username2",
      timestamp: "2023/2/1 10:10",
      text: "Hi, Moment Swap",
      media: "https://t7.baidu.com/it/u=2799580300,2163389035&fm=193&f=GIF",
      mediaType: "image",
    },
    {
      id: "5",
      address: "0xa0316faA558AEb07a5B8497ef5fB05d528132E59",
      userImg: "https://t7.baidu.com/it/u=1599120451,1304750759&fm=193&f=GIF",
      username: "userfoo",
      timestamp: "2023/2/1 00:00",
      text: "Hi, Moment Swap",
      media: "https://t7.baidu.com/it/u=1599120451,1304750759&fm=193&f=GIF",
      mediaType: "image",
    },
  ];
};

export const getCommentsByMomentId = (id: string): Array<CommentType> => {
  return JSON.parse(localStorage.getItem("comments") || "{}")[id];
};

export const postComment = (momentID: string, comment: CommentType) => {
  const commentsMap: Map<string, Array<CommentType>> = JSON.parse(
    localStorage.getItem("comments") || "{}"
  );
  const comments = commentsMap[momentID] || [];
  comment.id = comments.length.toString();
  comment.timestamp = new Date().toLocaleString();
  comments.push(comment);

  commentsMap[momentID] = comments;
  // console.log(commentsMap);
  localStorage.setItem("comments", JSON.stringify(commentsMap));
};

export const getLikesByMomentId = (id: string): Array<string> => {
  return JSON.parse(localStorage.getItem("likes") || "{}")[id];
};

export const storeLikes = (momentID: string, username: string) => {
  const likesMap: Map<string, Array<string>> = JSON.parse(
    localStorage.getItem("likes") || "{}"
  );
  let likes: Array<string> = likesMap[momentID] || [];
  if (likes?.includes(username)) {
    likes = likes.filter((l) => l != username);
  } else {
    likes.push(username);
  }
  likesMap[momentID] = likes;
  localStorage.setItem("likes", JSON.stringify(likesMap));
};
