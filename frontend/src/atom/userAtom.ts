import { atom } from "recoil";

export const userState = atom<{
  name: string;
  username: string;
  uid: string;
  userImg: string;
} | null>({
  key: "userState", // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});
