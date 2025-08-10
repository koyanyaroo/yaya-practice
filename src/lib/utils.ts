import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function calculateAccuracy(correct: number, total: number): number {
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

export function getScoreStars(accuracy: number): number {
  if (accuracy >= 90) return 3
  if (accuracy >= 70) return 2
  if (accuracy >= 50) return 1
  return 0
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export function getSubjectColor(subject: string): string {
  switch (subject) {
    case 'math':
      return 'bg-blue-500'
    case 'english':
      return 'bg-green-500'
    case 'science':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

export function getDifficultyColor(difficulty?: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'hard':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Audio utilities for text-to-speech
export function speakText(text: string): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    utterance.pitch = 1.1
    speechSynthesis.speak(utterance)
  }
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel()
  }
}
