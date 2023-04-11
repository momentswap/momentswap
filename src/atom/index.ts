import { atom } from "recoil";

export const momentIdState = atom({
  key: "momentIdState", // unique ID (with respect to other atoms/selectors)
  default: "", // default value (aka initial value)
});

export const searchKeyState = atom({
  key: "searchKeyState",
  default: "",
});

export const loadingState = atom({
  key: "loadingState",
  default: {},
});