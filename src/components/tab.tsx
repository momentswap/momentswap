import { Dispatch, FC, SetStateAction, useMemo } from "react";

type Props = {
  tabs: string[];
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
};

export const Tab: FC<Props> = ({ tabs, activeTab, setActiveTab }) => {
  const tabWidth = useMemo(() => {
    switch (tabs.length) {
      case 1:
        return "w-full";
      case 2:
        return "w-1/2";
      case 3:
        return "w-1/3";
      case 4:
        return "w-1/4";
      case 5:
        return "w-1/5";
      case 6:
        return "w-1/6";
      default:
        return "w-auto";
    }
  }, [tabs]);
  if (tabs.length === 0) return <></>;
  if (tabs.findIndex((t) => t === activeTab) === -1) activeTab = tabs[0];
  return (
    <div className="tabs font-semibold">
      {tabs.map((tab) => (
        <a
          key={tab}
          className={`tab tab-bordered ${tabWidth} ${activeTab === tab ? "tab-active" : ""}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </a>
      ))}
    </div>
  );
};
