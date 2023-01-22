<script lang="ts" setup>
const visible = ref(false)

chrome.storage.local.get('visible').then((result) => {
    visible.value = result.visible
})

function toggleVisible() {
    visible.value = !visible.value
}

watch(visible, (value) => {
    chrome.storage.local.set({ visible: value })
})

chrome.runtime.onMessage.addListener((message) => {
    if (message.toggleVisible) toggleVisible()
})
</script>

<template>
    <link
        href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css"
        rel="stylesheet"
    />
    <PopUp v-if="visible" v-model:visible="visible" id="cos-search" />
    <Teleport to=".navbar-end">
        <a class="navbar-item" @click.prevent="toggleVisible">🔍</a>
    </Teleport>
</template>

<style>
body:has(#cos-search) .sidebar > .course-list > .course:not(.show) {
    display: none !important;
}
</style>
