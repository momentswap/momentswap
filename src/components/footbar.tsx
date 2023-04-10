import { HomeIcon, UserIcon } from "@heroicons/react/outline";

import { useWalletProvider } from "src/hooks/use-wallet-provider";
import { PublishButton } from "./publish-button";
import { SidebarMenuItem } from "./sidebar-menuItem";

export const Footbar = () => {
  const { address } = useWalletProvider();

  return (
    <div className="sm:hidden">
      <div className="fixed left-0 bottom-0 z-50 w-full">
        <div className="bg-base-200 h-12 flex items-center justify-around">
          <SidebarMenuItem text="Home" Icon={HomeIcon} active link={"/"} />
          <div className="pb-10">
            <PublishButton />
          </div>
          <SidebarMenuItem text="Profile" Icon={UserIcon} link={`/user?address=${address}`} />
        </div>
      </div>
    </div>
  );
};
