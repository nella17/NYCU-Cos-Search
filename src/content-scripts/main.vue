<script lang="ts" setup>
const visible = ref(true)

chrome.runtime.onMessage.addListener((message) => {
    if (message.toggleVisible) {
        visible.value = !visible.value
    }
})
</script>

<template>
    <div v-show="visible">
        <PopUp />
    </div>
</template>
