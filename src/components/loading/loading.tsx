import s from "./loading.module.scss";

export const Loading = () => {
  return (
    <div className="m-4 max-sm:flex justify-start m-2 items-center">
      <span className="mr-2">Loading</span>
      <div className={s.progressLoader}>
        <div className={s.progress}></div>
      </div>
    </div>
  );
};
