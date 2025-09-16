import { inject } from 'vue'
import { formItemContextKey } from 'element-plus'

export default function useValidate() {
  const formItem = inject(formItemContextKey, undefined)

  const elValidate = (trigger: 'blur' | 'change') => {
    formItem?.validate?.(trigger).catch(() => {})
  }
  return {
    formItem,
    elValidate
  }
}
