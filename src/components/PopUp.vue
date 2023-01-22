<script lang="ts" setup>
import { Course, CourseWrap } from '@/types'
import Fuse from 'fuse.js'

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

const dataStore = useDataStore()
const { courses } = storeToRefs(dataStore)

const select = ref<Course>()
const search = ref<string>('')
const loading = ref(false)

let fuse = new Fuse([] as CourseWrap[])
dataStore.setup().then(() => {
    fuse = new Fuse(unref(courses), {
        findAllMatches: true,
        keys: [
            'course.cos_cname',
            'course.cos_ename',
            'course.lecturers',
            'course.cos_time',
            'course.cos_id',
            'course.master_dep_cname',
            'course.master_dep_ename',
        ],
    })
})

const courseItems = computed(() => {
    try {
        loading.value = true
        return fuse
            .search(search.value)
            .map(({ item }) => ({
                value: `${item.course.cos_cname} (${item.course.cos_id})`,
                ...item,
            }))
            .slice(0, 100)
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <v-container class="popup">
        <button class="close" @click.stop="toggleVisible">X</button>
        <div class="content">
            <v-autocomplete
                label="Search courses"
                variant="underlined"
                hide-no-data
                hide-details
                autofocus
                clearable
                return-object
                v-model="select"
                v-model:search="search"
                :loading="loading"
                :items="courseItems"
                item-title="value"
            />
        </div>
    </v-container>
</template>

<style scoped>
.popup {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
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
    color: rgba(0, 0, 0, 0.7);
}
</style>
