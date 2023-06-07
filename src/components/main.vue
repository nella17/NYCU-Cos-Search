<script lang="ts" setup>
import { SnackBar } from '@/types'

const visible = ref(false)
const dataStore = useDataStore()

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
    if (message.token) dataStore.setToken(message.token)
})

const snackbars = reactive([] as SnackBar[])
const snackbar = computed(() => snackbars.at(0)!)

function hideSnackbar() {
    snackbars.shift()
}
const showSnackbar = computed({
    get: () => snackbars.length > 0,
    set: (value) => {
        if (!value) hideSnackbar()
    },
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
        @snackbar="o => snackbars.push(o)"
        id="cos-search"
        class="fixed-top"
    />

    <v-btn
        class="fixed-top toggle-visibility"
        icon="mdi-magnify"
        @click.prevent="toggleVisibility"
    />

    <v-snackbar
        v-model="showSnackbar"
        v-bind="snackbar?.attrs"
    >
        {{ snackbar.message }}
        <template v-slot:actions>
            <v-btn
                v-for="action in snackbar.actions"
                variant="text"
                @click="action.onClick(hideSnackbar)"
                v-bind="action.attrs"
            >
                {{ action.label }}
            </v-btn>
        </template>
    </v-snackbar>
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
