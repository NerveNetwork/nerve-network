import { useToast as useVToast } from 'vue-toastification';
export { ToastOptions } from 'vue-toastification/src/types/index';

const errors = ['INSUFFICIENT_FUNDS'];

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
    if (errorFromEthers) {
      toast.error(message);
    } else {
      toast.error(message);
    }
  };
  return {
    toast,
    toastSuccess,
    toastError
  };
}
