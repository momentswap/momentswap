import { useWalletProvider } from "src/hooks/use-wallet-provider";
import { PublishSvg } from "./svgIcon/PublishSvg";
import { HomeIcon, UserIcon } from "@heroicons/react/outline";
import { SidebarMenuItem } from "./sidebar-menuItem";
import { Loading } from "./loading/loading";
import { useLoadingStore } from "src/ZusStore/useLoadingStore";

export const MbFootBar = () => {
  const { address } = useWalletProvider();
  const loading = useLoadingStore((state) => state.loading);

  return (
    <>
      <div className="fixed bg-base-100 left-0 bottom-0 z-10">
        <div className="sm:hidden">{loading === 1 ? <Loading /> : null}</div>

        <div className=" min-w-[100vw]  h-20 flex items-center justify-between">
          <SidebarMenuItem text="Home" Icon={HomeIcon} active link={"/"} />
          <PublishSvg />
          <SidebarMenuItem text="Profile" Icon={UserIcon} link={`/user?address=${address}`} />
        </div>
      </div>
    </>
  );
};
