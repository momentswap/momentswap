import { Dispatch, FC, SetStateAction } from "react";

type Props = {
  tabs: string[];
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
};

export const Tab: FC<Props> = ({ tabs, activeTab, setActiveTab }) => {
  if (tabs.length === 0) return <></>;
  if (tabs.findIndex((t) => t === activeTab) === -1) activeTab = tabs[0];
  return (
    <div className="tabs font-semibold">
      {tabs.map((tab) => (
        <a
          key={tab}
          className={`tab tab-bordered w-1/${tabs.length} ${activeTab === tab && "tab-active"}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </a>
      ))}
    </div>
  );
};
