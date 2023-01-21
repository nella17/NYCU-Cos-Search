<script lang="ts" setup>
const visible = ref(true)

function toggleVisible() {
    visible.value = !visible.value
}

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
