import type { FunctionalComponentOptions } from 'vue'
import type { ExtendedVue } from 'vue/types/vue'
import type { RecordPropsDefinition } from 'vue/types/options'

export const extendVue = <Props>(definition: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>) => definition as unknown as ExtendedVue<Vue, {}, {}, {}, Props>
