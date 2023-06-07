<script lang="ts" setup>
const visible = ref(false)

function toggleVisibility() {
    visible.value = !visible.value
}

watch(
    visible,
    (value) => {
        chrome.storage.local.set({ visible: value })
    },
    { immediate: true },
)

chrome.runtime.onMessage.addListener((message) => {
    if (message.toggleVisibility) toggleVisibility()
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
        class="fixed-top toggle-visibility"
        icon="mdi-magnify"
        @click.prevent="toggleVisibility"
    />
</template>

<style>
.fixed-top {
    position: fixed;
    z-index: 1500;
}
</style>

<style scoped>
.toggle-visibility {
    bottom: 20px;
    right: 20px;
}
</style>
