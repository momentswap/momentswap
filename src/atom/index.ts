import { atom } from "recoil";

export const momentIdState = atom({
  key: "momentIdState", // unique ID (with respect to other atoms/selectors)
  default: "id", // default value (aka initial value)
});
