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

const selectCourse = ref<CourseWrap>()
const paths = computed(
    () => selectCourse.value?.paths.map((path) => ({ path })) ?? [],
)
const searchCourse = ref<string>('')
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
            .search(searchCourse.value)
            .map(({ item }) => item)
            .slice(0, 100)
    } finally {
        loading.value = false
    }
})

const selectPath = ref<{ path: DepPath }>()

watch(selectPath, async (value) => {
    if (value) {
        await goDep(value.path)
            .catch((err) => {
                console.error(err)
                alert(`Error when go to ${path2str(value)}`)
            })
        const list = document.querySelector('.course-list') as HTMLElement
        for (const el of Array.from(list.children) as HTMLElement[]) {
            if (el.innerText.indexOf(selectCourse.value?.course.cos_id ?? '') !== -1) {
                el.classList.add('show')
            }
        }
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
                v-model="selectCourse"
                v-model:search="searchCourse"
                :loading="loading"
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
                v-model="selectPath"
                :items="paths"
                :item-title="path2str"
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
