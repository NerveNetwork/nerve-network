import { useToast as useVToast } from 'vue-toastification';
export type { ToastOptions } from 'vue-toastification/dist/types/types';

const errors = ['INSUFFICIENT_FUNDS'];

function classifyError(message: string) {
  const msg = (message || '').toLowerCase()
  const linkKeywords = [
    'network error',
    'timeout',
    'failed to fetch',
    'could not detect network',
    'missing revert data',
    'no rpc urls configured'
  ]
  const userKeywords = [
    'insufficient funds',
    'invalid address',
    'transfer amount exceeds balance',
    'insufficient allowance',
    'approve failed'
  ]
  if (linkKeywords.some(keyword => msg.includes(keyword))) {
    return 'link'
  }
  if (userKeywords.some(keyword => msg.includes(keyword))) {
    return 'user'
  }
  return 'unknown'
}

export const parseErrorMsg = (error: any) => {
  if (!error.code) {
    return {
      errorFromEthers: false,
      message:
        error.error?.error?.message || error.reason || error.message || error
    };
  }
  if (error.message?.indexOf('insufficient funds for gas * price') > -1) {
    return {
      errorFromEthers: true,
      message: 'BALANCE_NOT_ENOUGH'
    };
  }
  if (errors.includes(error.code)) {
    return {
      errorFromEthers: true,
      message: error.code
    };
  } else {
    return {
      errorFromEthers: false,
      message:
        error.error?.error?.message || error.reason || error.message || error
    };
  }
};

export default function useToast() {
  const toast = useVToast();
  const toastSuccess = (message: string) => {
    toast.success(message);
  };
  const toastError = (error: any) => {
    const { errorFromEthers, message } = parseErrorMsg(error);
    const category = classifyError(String(message))
    const finalMessage =
      category === 'link'
        ? `[链路故障] ${message}`
        : category === 'user'
          ? `[用户输入错误] ${message}`
          : message
    if (errorFromEthers) {
      toast.error(finalMessage);
    } else {
      toast.error(finalMessage);
    }
  };
  return {
    toast,
    toastSuccess,
    toastError
  };
}
