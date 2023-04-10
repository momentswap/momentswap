import { useWalletProvider } from "src/hooks/use-wallet-provider";
import { PublishSvg } from "./svgIcon/PublishSvg";
import { HomeIcon, UserIcon } from "@heroicons/react/outline";
import { SidebarMenuItem } from "./sidebar-menuItem";

export const MbFootBar = () => {
  const { address } = useWalletProvider();

  return (
    <>
      <div className="fixed bg-base-100 left-0 bottom-0 z-10">
        <div className=" min-w-[100vw]  h-20 flex items-center justify-between">
          <SidebarMenuItem text="Home" Icon={HomeIcon} active link={"/"} />
          <div className="">
            <PublishSvg />
          </div>
          <SidebarMenuItem text="Profile" Icon={UserIcon} link={`/user?address=${address}`} />
        </div>
      </div>
    </>
  );
};
