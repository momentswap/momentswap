import { notification, Space } from 'antd';

export const useNotificationLoading=()=>{
  const [api, contextHolder] = notification.useNotification();

    const openNotificationInfo = (placement: string,loading?:React.ReactNode) => {
        api.info({
          message: placement,
          description: loading,
          placement:"topRight",
          duration:loading?null:3
        });
      };

      return {
        api,
        contextHolder,
        openNotificationInfo,
      }
}