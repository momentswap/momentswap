import Link from "next/link";
import React from "react";
import { useWalletProvider } from "src/contexts/wallet-provider";
import { Avatar } from "./avatar";

export default function Account() {
  const { signerAddress } = useWalletProvider();
  const dropdownHidden = signerAddress ? "" : " hidden";
  return (
    <div className={"dropdown dropdown-end"}>
      <div tabIndex={0}>
        <Avatar address={signerAddress} />
      </div>
      <ul
        tabIndex={0}
        className={
          "dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" +
          dropdownHidden
        }
      >
        <li>
          <Link href="/moment">My Moments</Link>
        </li>
        <li>
          <Link href="/moment/bookmark">My Bookmarks</Link>
        </li>
        <li>
          <Link href="/submit">Submit Moment</Link>
        </li>
      </ul>
    </div>
  );
}
