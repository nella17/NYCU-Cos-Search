<script lang="ts" setup>
import { DepPath, CourseWrap, SnackBar } from '@/types'
import Fuse from 'fuse.js'
import {
    coursewrap2title,
    limitStr,
    path2str,
} from '@/composables/utils'

interface Props {
    visible?: boolean
}

interface Emits {
    (event: 'update:visible', value: boolean): void
    (event: 'snackbar', snackbar: SnackBar): void
}

const props = withDefaults(defineProps<Props>(), {
    visible: true,
})

const emit = defineEmits<Emits>()

function toggleVisibility() {
    emit('update:visible', !props.visible)
}

function showError(error: any) {
    console.error(error)
    emit('snackbar', {
        message: error.message ?? error.toString(),
        attrs: {
            timeout: -1,
        },
        actions: [
            {
                label: 'Reload',
                attrs: {
                    color: 'deep-orange-lighten-3',
                },
                onClick() {
                    location.reload()
                },
            },
            {
                label: 'Close',
                attrs: {
                    color: 'white',
                },
                onClick(close) {
                    close()
                },
            },
        ],
    })
}

const dataStore = useDataStore()
const { courses } = storeToRefs(dataStore)

const courseSelect = ref<CourseWrap>()
const paths = computed(
    () => courseSelect.value?.paths.map((path) => ({ path })) ?? [],
)
const courseSearch = ref<string>('')
const initialized = ref(false)
const loading = ref(0)

let fuse = new Fuse([] as CourseWrap[])
nextTick(async () => {
    loading.value++
    await dataStore.setup().catch(showError)
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
            'course.brief',
            'course.wType_cname',
            'course.wType_ename',
            'course.category_cname',
            'course.category_ename',
            'course.GroupName',
            'course.GroupName_E',
            'pathstrs',
        ],
    })
    loading.value--
    initialized.value = true
})

const courseItems = computed(() => {
    try {
        loading.value++
        return fuse
            .search(courseSearch.value)
            .map(({ item }) => item)
            .slice(0, 100)
    } finally {
        loading.value--
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
        loading.value++

        const changeDep = await goDep(value.path).catch((error) => {
            console.error(error)
            showError(`Error when go to ${path2str(value)}`)
        })
        const courseList = document.querySelector('.course-list') as HTMLElement

        if (changeDep) await waitDomChanged(courseList, { childList: true })
        if (pathSelect.value === value) {
            for (const el of Array.from(courseList.children) as HTMLElement[]) {
                if (el.innerText.indexOf(cos_id) !== -1) {
                    courseList.scroll({
                        top: el.offsetTop - courseList.offsetTop,
                        behavior: 'smooth',
                    })
                    break
                }
            }
        }

        loading.value--
    }
})
</script>

<template>
    <v-container class="popup">
        <button class="close" @click.stop="toggleVisibility">X</button>
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
                :disabled="!initialized"
                :items="courseItems"
                :item-title="coursewrap2title"
                no-filter
            >
                <template v-slot:item="{ props, item: { raw: { course } } }">
                    <v-list-item v-bind="props" lines="two">
                        <v-list-item-subtitle>
                            {{ course.master_dep_cname }}
                            {{ limitStr(course.lecturers, 5, 5) }}
                            {{ course.registered_num }} / {{ course.num_limit }}
                            ({{ course.cos_credit }} / {{ course.cos_hours }})
                            {{ course.cos_time }}
                            <br>
                            {{ limitStr(course.memo, 30, 20) }}
                        </v-list-item-subtitle>
                    </v-list-item>
                </template>
            </v-autocomplete>

            <v-autocomplete
                label="Search Path"
                variant="underlined"
                hide-no-data
                hide-details
                clearable
                return-object
                v-model="pathSelect"
                v-model:menu="pathManu"
                :disabled="!courseSelect"
                :items="paths"
                :item-title="path2str"
            />

            <v-progress-linear
                v-show="loading > 0"
                indeterminate
                rounded
                height="5"
                color="primary"
            />

            <span v-if="!initialized" class="text-caption">
                Loading course data...
            </span>
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
