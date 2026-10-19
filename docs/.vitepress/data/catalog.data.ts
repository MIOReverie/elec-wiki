/**
 * 把构建期的内容目录交给 Vue 组件使用。
 * 组件里 `import { data } from '../../data/catalog.data'` 即可拿到，
 * 无需在页面里手写章节清单（避免清单与文件不同步）。
 */
import { defineLoader } from 'vitepress'
import { getCourses, getRecent, type Course, type RecentItem } from './catalog'

export interface CatalogData {
  courses: Course[]
  recent: RecentItem[]
  totals: {
    chapters: number
    pages: number
    minutes: number
    chars: number
    examples: number
    demos: number
  }
}

declare const data: CatalogData
export { data }

export default defineLoader({
  load(): CatalogData {
    const courses = getCourses()
    const chapters = courses.flatMap((c) => c.chapters)
    const pages = chapters.length + 8 // 课程主页、工具页、指南页的粗略计数
    return {
      courses,
      recent: getRecent(8),
      totals: {
        chapters: chapters.length,
        pages,
        minutes: chapters.reduce((s, c) => s + (c.minutes || 0), 0),
        chars: chapters.reduce((s, c) => s + c.chars, 0),
        examples: chapters.reduce((s, c) => s + c.examples, 0),
        demos: chapters.reduce((s, c) => s + c.demos, 0)
      }
    }
  }
})
