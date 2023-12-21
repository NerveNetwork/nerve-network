import { App } from 'vue';
import { copys, toThousands, formatNumber } from '@/utils/util';
import useToast, { ToastOptions } from '@/hooks/useToast';

// 绑定到this实例上的方法
export function useGlobalProperties(app: App) {
  const { toast, toastSuccess } = useToast();
  app.config.globalProperties.$copy = function (str: string) {
    copys(str);
    toastSuccess(this.$t('public.public13'));
  };

  app.config.globalProperties.$thousands = function (str: string | number) {
    return toThousands(str);
  };

  app.config.globalProperties.$format = function (str: string | number) {
    return formatNumber(str);
  };

  app.config.globalProperties.$toast = function (
    msg: string,
    options: ToastOptions = {}
  ) {
    const { type = 'success', ...rest } = options;
    toast(msg, {
      // @ts-ignore
      type,
      ...rest
    });
  };
}
