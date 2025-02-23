<template>
    <li class="text-gray-400" active-class="active">
        <router-link :to="namedRoute">{{ linkTitle }}</router-link>
    </li>
</template>
<script setup>
defineProps({
    linkTitle: String,
    namedRoute: Object,
})

</script>
<style>
a.router-link-active {
  color: #ffffff;
}
</style>