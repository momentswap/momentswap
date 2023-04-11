import style from "./loading.module.scss";

export const Loading = () => {
  return (
    <div className="m-4 max-sm:flex justify-start items-center">
      <span className="mr-2">Loading</span>
      <div className={style.progressLoader}>
        <div className={style.progress}></div>
      </div>
    </div>
  );
};
