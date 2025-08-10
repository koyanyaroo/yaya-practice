import { z } from 'zod'

// Subject types
export type Subject = 'math' | 'english' | 'science'

// Question types
export type QuestionType = 
  | 'mcq_single' 
  | 'mcq_multi' 
  | 'short_answer' 
  | 'true_false' 
  | 'fill_blank' 
  | 'match' 
  | 'order'

export type Difficulty = 'easy' | 'medium' | 'hard'

// Media schema
const MediaSchema = z.object({
  imageUrl: z.string().url().optional(),
  audioUrl: z.string().url().optional(),
}).optional()

// Choice schema for MCQ, match, and order questions
const ChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
})

// Answer schemas for different question types
const AnswerSchema = z.union([
  z.string(), // MCQ single, short answer, fill blank
  z.array(z.string()), // MCQ multi, short answer alternates, order
  z.boolean(), // True/False
  z.array(z.object({
    leftId: z.string(),
    rightId: z.string(),
  })), // Match
])

// Question schema
export const QuestionSchema = z.object({
  id: z.string(),
  subject: z.enum(['math', 'english', 'science']),
  topic: z.string(),
  skill: z.string(),
  prompt: z.string(),
  media: MediaSchema,
  type: z.enum(['mcq_single', 'mcq_multi', 'short_answer', 'true_false', 'fill_blank', 'match', 'order']),
  choices: z.array(ChoiceSchema).optional(),
  answer: AnswerSchema,
  explanation: z.string().optional(),
  hint: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string()).optional(),
  cambridgeRef: z.string().optional(),
})

// Set schema
export const SetSchema = z.object({
  id: z.string(),
  title: z.string(),
  subject: z.enum(['math', 'english', 'science']),
  description: z.string().optional(),
  questionIds: z.array(z.string()),
  recommendedOrder: z.enum(['fixed', 'random']).optional(),
  timeLimitSeconds: z.number().positive().optional(),
})

// Data structure for the complete JSON file
export const DataSchema = z.object({
  questions: z.array(QuestionSchema),
  sets: z.array(SetSchema),
})

// TypeScript types inferred from schemas
export type Question = z.infer<typeof QuestionSchema>
export type QuestionSet = z.infer<typeof SetSchema>
export type Choice = z.infer<typeof ChoiceSchema>
export type Media = z.infer<typeof MediaSchema>
export type Answer = z.infer<typeof AnswerSchema>
export type AppData = z.infer<typeof DataSchema>

// Progress tracking types
export interface QuestionAttempt {
  questionId: string
  isCorrect: boolean
  userAnswer: Answer
  timeSpent: number
  hintsUsed: number
  timestamp: Date
}

export interface SetProgress {
  setId: string
  attempts: QuestionAttempt[]
  score: number
  totalQuestions: number
  completedAt?: Date
  timeSpent: number
}

export interface ChildProfile {
  id: string
  name: string
  avatar?: string
  createdAt: Date
  progress: SetProgress[]
  preferences: {
    theme: 'light' | 'dark' | 'high-contrast'
    dyslexiaFriendly: boolean
    audioEnabled: boolean
  }
}

// Filter types for search and filtering
export interface FilterOptions {
  subject?: Subject
  topic?: string
  skill?: string
  difficulty?: Difficulty
  tags?: string[]
}

// Theme types
export type Theme = 'light' | 'dark' | 'high-contrast'

// Report types
export interface TopicScore {
  topic: string
  correct: number
  total: number
  accuracy: number
}

export interface SkillScore {
  skill: string
  correct: number
  total: number
  accuracy: number
  lastAttempt: Date
}

export interface Report {
  childId: string
  dateRange: {
    start: Date
    end: Date
  }
  totalQuestions: number
  totalCorrect: number
  overallAccuracy: number
  timeSpent: number
  topicScores: TopicScore[]
  skillScores: SkillScore[]
  streak: number
  badges: string[]
}
