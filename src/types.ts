export interface Dep {
    label: string
    value: string
    children?: Dep[]
}

export type DepPath = Dep[]

export interface Course {
    GroupName: string
    GroupName_E: string
    TURL: string
    URL: string
    acy: string
    blocked: string
    brief: string
    brief_E: string
    category_cname: any
    category_ename: any
    category_type: any
    cos_cname: string
    cos_credit: string
    cos_ename: string
    cos_hours: string
    cos_id: string
    cos_practice_hours: string
    cos_teaching_hours: string
    cos_time: string
    cos_type_code: string
    crsoutline: string
    degree: string
    dep_id: string
    fifth_wish_reserved_num: string
    first_wish_reserved_num: string
    fourth_wish_reserved_num: string
    lecturers: string
    lecturers_E: string
    master_dep_cname: string
    master_dep_ename: string
    memo: string
    num_limit: string
    priority: string
    registered_num: string
    reserved_num: string
    sFlag: any
    second_wish_reserved_num: string
    sem: string
    student_id: any
    student_wtype: any
    third_wish_reserved_num: string
    wType: string
    wType_cname: string
    wType_ename: string
}

export interface CourseWrap {
    course: Course
    dep_uid: string
}
