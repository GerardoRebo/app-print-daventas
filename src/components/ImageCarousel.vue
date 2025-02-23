<template>
    <div class="relative w-full mx-auto">
        <div class="overflow-hidden relative h-64">
            <!-- Carousel Items -->
            <div class="flex transition-transform duration-300"
                :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
                <div v-for="(image, index) in images" :key="index" class="w-full flex-shrink-0">
                    <img :src="image.url" :alt="'Image ' + (index + 1)" class="object-cover h-64 w-full" />
                </div>
            </div>
        </div>

        <!-- Navigation Arrows -->
        <button @click="prevSlide"
            class="absolute top-1/2 left-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700">
            &larr;
        </button>
        <button @click="nextSlide"
            class="absolute top-1/2 right-0 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700">
            &rarr;
        </button>

        <!-- Dots -->
        <div class="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
            <span v-for="(image, index) in images" :key="index" @click="goToSlide(index)" :class="{
                'bg-gray-800': index === currentIndex,
                'bg-gray-400': index !== currentIndex,
            }" class="w-3 h-3 rounded-full cursor-pointer"></span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    images: {
        type: Array,
        required: true,
    },
});

const currentIndex = ref(0);

const prevSlide = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    } else {
        currentIndex.value = props.images.length - 1;
    }
};

const nextSlide = () => {
    if (currentIndex.value < props.images.length - 1) {
        currentIndex.value++;
    } else {
        currentIndex.value = 0;
    }
};

const goToSlide = (index) => {
    currentIndex.value = index;
};
</script>

<style scoped>
.carousel-item {
    transition: transform 0.3s ease-in-out;
}
</style>