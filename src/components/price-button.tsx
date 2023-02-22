import { FC, MouseEventHandler, ReactNode } from "react";

type Props = {
  price?: string;
  htmlFor?: string;
  iconSrc?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export const PriceButton: FC<Props> = ({ onClick, children, iconSrc, htmlFor, price }) => {
  return (
    <div
      onClick={onClick}
      className="border-2 rounded-full hover:border-neutral active:border-neutral-focus w-32 h-8 overflow-hidden hvr-shadow"
    >
      <div className="flex items-center text-sm p-1">
        <img src={iconSrc} alt="Token" className="w-4 h-4" />
        <span className="truncate mx-auto">{price || "0"}</span>
      </div>
      <label
        htmlFor={htmlFor}
        className="block relative -top-8 w-32 h-8 cursor-pointer text-sm text-white text-center font-bold leading-9 bg-neutral active:bg-neutral-focus opacity-0 hover:opacity-100"
      >
        {children}
      </label>
      )
    </div>
  );
};
