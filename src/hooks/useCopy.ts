import { copys } from '@/utils/util';
import { useI18n } from 'vue-i18n';
import useToast from './useToast';

export default function useCopy() {
  const { t } = useI18n();
  const { toastSuccess } = useToast();

  function copy(str: string) {
    copys(str);
    toastSuccess(t('public.public13'));
  }

  return {
    copy
  };
}
