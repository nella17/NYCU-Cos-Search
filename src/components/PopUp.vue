<script lang="ts" setup>
interface Props {
    visible?: boolean
}

interface Emits {
    (event: 'update:visible', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
})

const emit = defineEmits<Emits>()

function toggleVisible() {
    emit('update:visible', !props.visible)
}

onMounted(async () => {
    const { token } = await chrome.runtime.sendMessage({ action: 'getToken' })
    if (!token) {
        if (confirm('Token not found, reload page?')) {
            location.reload()
        }
    } else {
        console.log('Token:', token)
        getData('/sysstatuslvl', { token })
            .then((resp) => resp.json())
            .then((resp) => console.log(resp))

        getData('/getpreregist', { token })
            .then((resp) => resp.json())
            .then((resp) => console.log(resp))
    }
})
</script>

<template>
    <div class="popup">
        <button class="close" @click.stop="toggleVisible">X</button>
        <div class="content">
            Hello, Vite-Plugin-Chrome-Extension
        </div>
    </div>
</template>

<style scoped>
.popup {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 1px 5px 0 rgb(0 0 0 / 50%);
    z-index: 999;
}
.close {
    position: absolute;
    top: 0;
    right: 0;
    padding: 0.5rem;
    border: none;
    background-color: transparent;
    font-size: 1rem;
    font-weight: 700;
    color: #000;
    cursor: pointer;
    transform: translate(10%, -10%);
}
.content {
    font-size: 1.5em;
    font-weight: 700;
    color: deepskyblue;
}
</style>
