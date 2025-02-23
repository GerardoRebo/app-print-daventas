<template>
    <p 
    class="
            inline-block
            px-4
            py-2
            
            cursor-pointer
          " :class="[theme]" @click="$emit('changeActive', elementId)">
        {{ titleId }}
    </p>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps(['titleId', 'elementId', 'activeTab', 'textColor', 'dark'])
const theme = computed(()=>{
  if (props.dark) {
    if (props.activeTab == props.elementId) {
      return 'text-orange-600 dark:text-orange-600 hover:text-orange-500 font-extrabold';
    }
      return 'text-gray-900  dark:text-gray-50 hover:text-gray-700';
  }else{
    if (props.activeTab == props.elementId) {
      return 'text-orange-600 hover:text-orange-500 font-extrabold';
    }
    return 'text-orange-500 hover:text-gray-200';
  }

})
</script>