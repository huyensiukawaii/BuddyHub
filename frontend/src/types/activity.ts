export const ACTIVITY_CATEGORIES = [
  'Ăn uống',
  'Học nhóm',
  'Board Games',
  'Thể thao',
  'Giao lưu',
  'Khác',
] as const

export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number]

export type CreateActivityForm = {
  category: ActivityCategory | ''
  title: string
  location: string
  date: string
  startTime: string
  endTime: string
  maxSlots: string
  purpose: string
  deadline: string
  chatLink: string
  description: string
}

export type FieldErrors = Partial<Record<keyof CreateActivityForm, string>>

export type Banner = {
  tone: 'error' | 'success'
  text: string
} | null
