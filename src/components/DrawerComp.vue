<template>
    <div id="drawer-left-example"
        class="fixed top-0 left-0 z-40 h-screen p-4 overflow-y-auto transition-transform   bg-white w-80 dark:bg-gray-800"
        :class="{
            '-translate-x-full': isDrawerOpen
        }" tabindex="-1" aria-labelledby="drawer-left-label">

        <p class="text-gray-200 font-semibold">{{ title }}</p>
        <button type="button" data-drawer-hide="drawer-left-example" aria-controls="drawer-left-example"
            @click="$emit('hideDrawer')"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 right-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white">
            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
            </svg>
            <span class="sr-only">{{ description }}</span>
        </button>
        <slot>

        </slot>
    </div>
</template>
<script setup>
defineProps(['title', 'description', 'isDrawerOpen'])
defineEmits(['hideDrawer'])
</script>