import Link from "next/link";
import React from "react";

type Props = {
  text: string;
  Icon: React.FC<any>;
  active?: boolean;
  link: string;
};

export const SidebarMenuItem = ({ text, Icon, active, link }: Props) => {
  return (
    <Link
      href={link}
      className="btn btn-ghost btn- flex items-center justify-center xl:justify-start text-lg space-x-3 my-3"
    >
      <Icon className="h-7" />
      <span className={`${active && "font-medium"} hidden xl:inline`}>{text}</span>
    </Link>
  );
};
