<template>
    <header :class="[classes]" class="bg-gradient-to-t from-gray-50 to-gray-100 dark:from-gray-400 dark:to-gray-500 
        shadow rounded-sm w-full
         py-1 px-2 space-y-2 md:space-y-0 md:space-x-2 md:py-2 md:px-4">
        <slot>

        </slot>
    </header>
</template>
<script setup>
import { ref } from 'vue';
const props = defineProps(['type'])

const classes = ref('')

if (props.type == 'desktop') {
    classes.value = 'hidden md:flex md:flex-col'
} else if (props.type == 'general') {
    classes.value = 'flex flex-col md:flex-row md:items-end'
} else {
    classes.value = 'flex flex-col md:hidden'
}
</script>