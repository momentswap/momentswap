import style from "./loading.module.scss";

export const Loading = () => {
  return (
    <div className="max-sm:flex justify-start items-center">
      <div className={style.loader}>
      </div>
    </div>
  );
};
