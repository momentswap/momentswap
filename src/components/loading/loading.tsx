import s from "./loading.module.scss";

export const Loading = () => {
  return (
    <div className="m-4">
      Loading
      <div className={s.progressLoader}>
        <div className={s.progress}></div>
      </div>
    </div>
  );
};
