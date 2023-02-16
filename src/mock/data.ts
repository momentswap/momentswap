import { CommentData } from "@utils/definitions/interfaces";

// export let mockMoments: Array<MomentMetadata> = [
//   {
//     id: "1",
//     address: "0xa0216faA558AEb07a5B8497ef5fB05d528132E84",
//     userImg: "https://t7.baidu.com/it/u=839828294,1619278046&fm=193&f=GIF",
//     username: "coco",
//     timestamp: "2023/2/2 10:10",
//     contentText: "Hi, Moment Swap",
//     media: "https://t7.baidu.com/it/u=839828294,1619278046&fm=193&f=GIF",
//     mediaType: "image",
//   },
//   {
//     id: "2",
//     address: "0xa0296faA558AEb07a5B8497ef5fB05d528132887",
//     userImg: "https://t7.baidu.com/it/u=839828294,1619278046&fm=193&f=GIF",
//     username: "coco",
//     timestamp: "2023/2/2 10:10",
//     contentText: "Hi, Moment Swap",
//     media: "https://www.f5.com/content/dam/f5-labs-v2/media-files/video/Happy%20Cow.mp4",
//     mediaType: "video",
//   },
//   {
//     id: "3",
//     address: "0xa1886faA558AEb07a5B8497ef5fB05d528132465",
//     userImg: "https://t7.baidu.com/it/u=2799580300,2163389035&fm=193&f=GIF",
//     username: "Lucy",
//     timestamp: "2023/2/2 10:10",
//     contentText: `The Filecoin Virtual Machine (FVM) is a runtime environment for smart contracts (also called actors) on the Filecoin network. FVM brings user programmability to Filecoin, unleashing the enormous potential of an open data economy.  https://fvm.filecoin.io/`,
//   },
//   {
//     id: "4",
//     address: "0xa3456faA558AEb07a5B8497ef5fB05d5281329a1",
//     userImg: "https://t7.baidu.com/it/u=2799580300,2163389035&fm=193&f=GIF",
//     username: "Lucy",
//     timestamp: "2023/2/1 10:10",
//     contentText: "Hi, Moment Swap",
//     media: "https://t7.baidu.com/it/u=2799580300,2163389035&fm=193&f=GIF",
//     mediaType: "image",
//   },
//   {
//     id: "5",
//     address: "0xa90116faA558AEb07a5B8497ef5fB05d528132C77",
//     userImg: "https://t7.baidu.com/it/u=1599120451,1304750759&fm=193&f=GIF",
//     username: "anya",
//     timestamp: "2023/2/1 00:00",
//     contentText: "Hi, Moment Swap",
//     media: "https://t7.baidu.com/it/u=1599120451,1304750759&fm=193&f=GIF",
//     mediaType: "image",
//   },
// ];

export const getCommentsByMomentId = (id: string): Array<CommentData> => {
  return JSON.parse(localStorage.getItem("comments") || "{}")[id];
};

export const postComment = (momentID: string, comment: CommentData) => {
  const commentsMap: Map<string, Array<CommentData>> = JSON.parse(localStorage.getItem("comments") || "{}");
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
  const likesMap: Map<string, Array<string>> = JSON.parse(localStorage.getItem("likes") || "{}");
  let likes: Array<string> = likesMap[momentID] || [];
  if (likes?.includes(username)) {
    likes = likes.filter((l) => l != username);
  } else {
    likes.push(username);
  }
  likesMap[momentID] = likes;
  localStorage.setItem("likes", JSON.stringify(likesMap));
};
