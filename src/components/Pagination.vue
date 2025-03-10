<template>
  <div class="flex items-end space-x-4 mx-4 m-2">
    <ul v-if="pages" class="list-reset">
      <li title="Usa las flechas para navegar" class="inline-block bg-white hover:bg-blue-100 border mr-1 rounded">
        <a
          href="#"
          class="no-underline text-gray-800 block py-3 px-4"
          :class="{
            'bg-gray-300 text-gray-800 cursor-not-allowed': currentPage == 1,
          }"
          @click.prevent="getPreviousPage"
          >&larr;</a
        >
      </li>

      <li
        v-for="(page, index) in range"
        :key="index"
        class="
          inline-block
          bg-white
          hover:bg-blue-100
          border-t border-b border-l
        "
        :class="{ 'border-2': index == range.length - 1 }"
      >
        <a
          v-if="page != '...'"
          href="#"
          class="no-underline text-gray-800 block py-3 px-4"
          :class="{ 'bg-blue-100': page == currentPage }"
          @click.prevent="getPage(page)"
        >
          {{ page }}
        </a>

        <a v-else href="#" class="no-underline text-gray-800 block py-3 px-4">
          {{ page }}
        </a>
      </li>

      <li title="Usa las flechas para navegar" class="inline-block bg-white hover:bg-blue-100 border ml-1 rounded">
        <a
          href="#"
          
          class="no-underline text-gray-800 block py-3 px-4"
          :class="{
            'bg-gray-100 text-grey cursor-not-allowed': currentPage >= pages,
          }"
          :style="[
            currentPage >= pages ? 'pointer-events: none cursor: default' : '',
          ]"
          @click.prevent="getNextPage"
          >&rarr;</a
        >
      </li>
    </ul>
    <p class="hidden sm:flex text-gray-400 text-sm">(Navega con teclado Ctrl + &rarr;)</p>
  </div>
</template>

<script>
export default {
  name: "Pagination",
  props: {
    pages: {
      type: Number,
      default: 0,
    },
    currentPage: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      range: [],
    };
  },
  mounted() {
    document.addEventListener("keydown", this.onEscape);
  },
  unmounted() {
    document.removeEventListener("keydown", this.onEscape);
  },
  computed: {
    propsToWatch() {
      return this.pages, this.currentPage, Date.now();
    },
  },
  watch: {
    propsToWatch: {
      handler: "organisePageLinks",
      immediate: true,
    },
  },
  methods: {
    organisePageLinks() {
      this.range = [];
      for (let i = 1; i <= this.pages; i++) {
        if (
          i == 1 || // first page
          i == this.pages || // last page
          i == this.currentPage || // current page
          i == this.currentPage - 1 || // page before current
          i == this.currentPage + 1 || // page after current
          (i <= 2 && this.currentPage < 2) || // "filler" links at start
          (i >= this.pages - 3 && this.currentPage > this.pages - 3) // "filler" links at end
        ) {
          let index = this.range.length;
          if (index > 0 && this.range[index - 1] < i - 1) {
            // if this page is not the next one insequence, add in 3 dots "..."
            this.range.push("...");
          }
          this.range.push(i);
        }
      }
    },
    getPage(page) {
      this.$emit("page-changed", page);
    },
    getPreviousPage() {
      this.getPage(this.currentPage - 1);
    },
    getNextPage() {
      if (this.currentPage >= this.pages) {
        return;
      }
      this.getPage(this.currentPage + 1);
    },
    onEscape(e) {
      if (e.ctrlKey && e.key === "ArrowRight") {
        this.getNextPage();
      }
      if (e.ctrlKey && e.key === "ArrowLeft") {
        this.getPreviousPage();
      }
    },
  },
};
</script>