import { useEffect } from "react";

import { Feed, Layout, Loading } from "@components";
import { useNotificationLoading, useNotifyStatus } from "@hooks";

export default function Home() {
  const notifyStatus = useNotifyStatus((state) => state.status);

  const { api, contextHolder, openNotificationInfo } = useNotificationLoading();
  useEffect(() => {
    if (notifyStatus === 0) {
      api.destroy();
    }
    if (notifyStatus === 1) {
      openNotificationInfo("Requesting transaction.", <Loading />);
    }
    if (notifyStatus === 2) {
      api.destroy();
      openNotificationInfo("Request transaction failed.");
    }
  }, [notifyStatus]);
  return (
    <>
      {contextHolder}
      <Layout>
        <Feed />
      </Layout>
    </>
  );
}
