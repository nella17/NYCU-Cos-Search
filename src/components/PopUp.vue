<script lang="ts" setup>
import { DepPath, CourseWrap } from '@/types'
import Fuse from 'fuse.js'
import { coursewrap2str, path2str } from '@/composables/utils'

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

const courseSelect = ref<CourseWrap>()
const paths = computed(
    () => courseSelect.value?.paths.map((path) => ({ path })) ?? [],
)
const courseSearch = ref<string>('')
const loading = ref(false)

let fuse = new Fuse([] as CourseWrap[])
nextTick(async () => {
    loading.value = true
    await dataStore.setup()
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
    loading.value = false
})

const courseItems = computed(() => {
    try {
        loading.value = true
        return fuse
            .search(courseSearch.value)
            .map(({ item }) => item)
            .slice(0, 100)
    } finally {
        loading.value = false
    }
})

const pathSelect = ref<{ path: DepPath }>()
const pathManu = ref(false)

watch(courseSelect, (value) => {
    if (value) {
        pathManu.value = true
    }
})

watch(pathSelect, async (value) => {
    const { cos_id } = courseSelect.value?.course ?? {}
    if (value && cos_id) {
        loading.value = true
        await goDep(value.path).catch((err) => {
            console.error(err)
            alert(`Error when go to ${path2str(value)}`)
        })
        await sleep(1000)
        const list = document.querySelector('.course-list') as HTMLElement
        for (const el of Array.from(list.children) as HTMLElement[]) {
            if (el.innerText.indexOf(cos_id) !== -1) {
                el.classList.add('show')
            }
        }
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
                v-model="courseSelect"
                v-model:search="courseSearch"
                :items="courseItems"
                :item-title="coursewrap2str"
                no-filter
            />

            <v-autocomplete
                label="Search Path"
                variant="underlined"
                hide-no-data
                hide-details
                clearable
                return-object
                v-model="pathSelect"
                v-model:menu="pathManu"
                :items="paths"
                :item-title="path2str"
            />

            <v-progress-linear
                v-show="loading"
                indeterminate
                rounded
                height="5"
                color="primary"
            />
        </div>
    </v-container>
</template>

<style scoped>
.popup {
    top: 20px;
    right: 20px;
    width: 400px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 1px 5px 0 rgb(0 0 0 / 50%);
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
