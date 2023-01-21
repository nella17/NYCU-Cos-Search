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
    <PopUp v-show="visible" v-model:visible="visible" />
    <Teleport to=".navbar-end">
        <a class="navbar-item" @click.prevent="toggleVisible">🔍</a>
    </Teleport>
</template>
