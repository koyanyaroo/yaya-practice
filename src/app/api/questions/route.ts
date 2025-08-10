import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { AppData, Question, QuestionSet } from '@/types'

interface QuestionFile {
  grade: number
  subject: 'math' | 'english' | 'science'
  title: string
  description: string
  questions: Array<{
    id: string
    question: string
    type: string
    options: string[]
    correct: number
    explanation: string
  }>
}

function loadQuestionFile(grade: number, subject: string): QuestionFile | null {
  try {
    const filePath = join(process.cwd(), 'data', 'questions', `grade-${grade}-${subject}.json`)
    const fileContent = readFileSync(filePath, 'utf-8')
    return JSON.parse(fileContent) as QuestionFile
  } catch (error) {
    console.error(`Error loading ${grade}-${subject}:`, error)
    return null
  }
}

function convertToAppFormat(files: QuestionFile[]): AppData {
  const questions: Question[] = []
  const sets: QuestionSet[] = []

  files.forEach(file => {
    // Convert questions
    const convertedQuestions = file.questions.map(q => ({
      id: q.id,
      subject: file.subject,
      topic: `Grade ${file.grade}`,
      skill: file.subject.charAt(0).toUpperCase() + file.subject.slice(1),
      prompt: q.question,
      type: 'mcq_single' as const,
      choices: q.options.map((option, index) => ({
        id: `${q.id}_choice_${index}`,
        text: option
      })),
      answer: q.options[q.correct],
      explanation: q.explanation,
      difficulty: file.grade <= 2 ? 'easy' as const : 
                 file.grade <= 4 ? 'medium' as const : 'hard' as const,
      tags: [`grade-${file.grade}`, file.subject]
    }))

    questions.push(...convertedQuestions)

    // Create a set for this grade/subject combination
    const setId = `grade-${file.grade}-${file.subject}`
    sets.push({
      id: setId,
      title: file.title,
      subject: file.subject,
      description: file.description,
      questionIds: convertedQuestions.map(q => q.id),
      recommendedOrder: 'random',
      timeLimitSeconds: convertedQuestions.length * 60 // 1 minute per question
    })
  })

  return { questions, sets }
}

export async function GET() {
  try {
    console.log('Loading question data from filesystem...')
    const files: QuestionFile[] = []

    // Load Grade 1 content only (comprehensive content available)
    for (const subject of ['math', 'english', 'science']) {
      const file = loadQuestionFile(1, subject)
      if (file) {
        files.push(file)
      }
    }

    if (files.length === 0) {
      console.error('No question files could be loaded')
      return NextResponse.json(
        { error: 'No question files could be loaded' },
        { status: 404 }
      )
    }

    console.log(`Loaded ${files.length} question files`)

    // Convert to app format
    const appData = convertToAppFormat(files)
    
    console.log(`Converted ${appData.questions.length} questions and ${appData.sets.length} sets`)

    return NextResponse.json(appData)
  } catch (error) {
    console.error('Error loading questions:', error)
    return NextResponse.json(
      { error: 'Failed to load question data' },
      { status: 500 }
    )
  }
}
