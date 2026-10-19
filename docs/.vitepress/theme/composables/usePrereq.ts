import { ref, shallowRef } from 'vue'
import { withBase } from 'vitepress'
import { PREREQ } from '../data/prereq'

export const prereqOpen = ref(false)
export const currentId = ref<string | null>(null)
export const prereqHtml = shallowRef('')
export const prereqLoading = ref(false)
export const prereqFailed = ref(false)

const cache = new Map<string, string>()

async function fetchCard(id: string): Promise<string> {
  if (cache.has(id)) return cache.get(id)!
  const item = PREREQ[id]
  if (!item?.page) return ''
  const url = withBase(item.page.replace(/\/$/, '') + '.html')
  const res = await fetch(url)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const text = await res.text()
  const doc = new DOMParser().parseFromString(text, 'text/html')
  const main =
    doc.querySelector('.vp-doc') ||
    doc.querySelector('main') ||
    doc.querySelector('#app')
  if (main) {
    // 独立页面有 H1（抽屉头部已经显示标题），抽出来时去掉
    main.querySelector('h1')?.remove()
    main.querySelectorAll('.header-anchor').forEach((a) => a.remove())
  }
  const html = main ? main.innerHTML : ''
  cache.set(id, html)
  return html
}

export async function openPrereq(id: string) {
  currentId.value = id
  prereqOpen.value = true
  prereqFailed.value = false
  if (cache.has(id)) {
    prereqHtml.value = cache.get(id)!
    return
  }
  if (!PREREQ[id]?.page) {
    prereqLoading.value = false
    return
  }
  prereqHtml.value = ''
  prereqLoading.value = true
  try {
    prereqHtml.value = await fetchCard(id)
  } catch {
    prereqFailed.value = true
    prereqHtml.value = ''
  } finally {
    prereqLoading.value = false
  }
}

export function closePrereq() {
  prereqOpen.value = false
}

export function currentItem() {
  return currentId.value ? PREREQ[currentId.value] : undefined
}
