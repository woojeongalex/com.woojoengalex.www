import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** FormData.get()/entries() 값(FormDataEntryValue: string | File)에서 안전하게 문자열만 추출 */
export function formEntryToString(
  value: FormDataEntryValue | undefined
): string {
  return typeof value === 'string' ? value : ''
}
