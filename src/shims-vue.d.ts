import Vue from 'vue'
import { I18n } from 'vue-i18n'
import { toThousands, formatNumber } from './utils/util'
declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $t: I18n['t'],
    $thousands: typeof toThousands,
    $format: typeof formatNumber,
    $copy: (str: string) => void
  }
}
