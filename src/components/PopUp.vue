<script lang="ts" setup>
import { Course } from '@/types'

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
onMounted(() => {
    dataStore.setup()
})

const select = ref<Course>()
const search = ref<string>('')
watch(select, (value) => {
    console.log('select', value)
})

const courseItems = computed(() =>
    !search.value
        ? []
        : courses.value
              .map(({ course, dep_uid }) => ({
                  dep_uid,
                  course,
                  value: `${course.cos_cname} ${course.cos_time}`,
              }))
              .filter(
                  ({ course }) =>
                      JSON.stringify(course).indexOf(search.value) > -1,
              )
              .slice(0, 100),
)
</script>

<template>
    <v-container class="popup">
        <button class="close" @click.stop="toggleVisible">X</button>
        <div class="content">
            <v-autocomplete
                label="Search courses"
                variant="underlined"
                hide-no-data
                autofocus
                clearable
                return-object
                v-model="select"
                v-model:search="search"
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
