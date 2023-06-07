<script lang="ts" setup>
const visible = ref(false)

function toggleVisible() {
    visible.value = !visible.value
}

watch(visible, (value) => {
    chrome.storage.local.set({ visible: value })
}, { immediate: true })

chrome.runtime.onMessage.addListener((message) => {
    if (message.toggleVisible) toggleVisible()
})
</script>

<template>
    <link
        href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css"
        rel="stylesheet"
    />
    <PopUp
        v-if="visible"
        v-model:visible="visible"
        id="cos-search"
        class="fixed-top"
    />
    <v-btn
        class="fixed-top toggle-visible"
        icon="mdi-magnify"
        @click.prevent="toggleVisible"
    />
</template>

<style>
body:has(#cos-search) .sidebar > .course-list > .course:not(.show) {
    display: none !important;
}
.fixed-top {
    position: fixed;
    z-index: 9999;
}
</style>


<style scoped>
.toggle-visible {
    bottom: 20px;
    right: 20px;
}
</style>
