import { Feed, Layout } from "@components";
import { useSpaceDomain, useWalletProvider } from "src/hooks";

import {
  RadiusUprightOutlined,
} from '@ant-design/icons';
import { useNotificationLoading } from "@hooks";
import { Loading } from "src/components/loading/loading";
import { Button } from "antd";
import { useEffect } from "react";
import { useNotifyStatus } from "@hooks/use-loading-store";

export default function Home() {
  const notifyStatus = useNotifyStatus((state) => state.status);

  const {api,contextHolder,openNotificationInfo} = useNotificationLoading()
  useEffect(()=>{
    if (notifyStatus===0){
     api.destroy()
    } 
    if (notifyStatus===1){
      openNotificationInfo('Publish Chain',<Loading/>)
     }
     if (notifyStatus===2){
      api.destroy()
      openNotificationInfo('Failed to publish moment.')
     }
  },[notifyStatus])
  return (
    <>
      {contextHolder}
      <Layout>
        <Feed />
      </Layout>
    </>
  );
}
