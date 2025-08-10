import fs from 'fs'
import path from 'path'
import { AppData, DataSchema, Question, QuestionSet } from '@/types'
import { PERSONALIZATION } from './personalization'

// Cache for static data
let staticDataCache: AppData | null = null

// Clear cache function (useful for development or grade changes)
export function clearDataCache() {
  staticDataCache = null
  console.log('📝 Data cache cleared')
}

// Get current grade level for YAYA (can be configured)
function getCurrentGrade(): number {
  // For now, YAYA is in Grade 1, but this can be easily updated
  return PERSONALIZATION.content?.currentGrade || 1
}

export async function getStaticAppData(): Promise<AppData> {
  // Return cached data if available
  if (staticDataCache) {
    return staticDataCache
  }

  try {
    const currentGrade = getCurrentGrade()
    const gradeDir = path.join(process.cwd(), 'data', 'questions', `grade-${currentGrade}`)
    
    console.log(`📚 Loading Grade ${currentGrade} data for ${PERSONALIZATION.user.name}...`)
    
    // Check if grade directory exists
    if (!fs.existsSync(gradeDir)) {
      console.warn(`Grade ${currentGrade} directory not found, falling back to comprehensive data`)
      return loadComprehensiveData()
    }
    
    const allQuestions: Question[] = []
    const allSets: QuestionSet[] = []
    
    // Load data from each subject directory
    const subjects = ['math', 'english', 'science']
    
    for (const subject of subjects) {
      const subjectDir = path.join(gradeDir, subject)
      const subjectFile = path.join(subjectDir, `${subject}-questions.json`)
      
      if (fs.existsSync(subjectFile)) {
        const fileContent = fs.readFileSync(subjectFile, 'utf8')
        const data = JSON.parse(fileContent)
        
        // Validate data structure
        const validatedData = DataSchema.parse(data)
        
        allQuestions.push(...validatedData.questions)
        allSets.push(...validatedData.sets)
        
        console.log(`✅ Loaded ${validatedData.questions.length} ${subject} questions, ${validatedData.sets.length} sets`)
      } else {
        console.warn(`${subject} data not found for Grade ${currentGrade}`)
      }
    }
    
    staticDataCache = {
      questions: allQuestions,
      sets: allSets
    }
    
    console.log(`🎯 Total loaded: ${allQuestions.length} questions, ${allSets.length} sets for ${PERSONALIZATION.user.name}`)
    
    return staticDataCache
  } catch (error) {
    console.error('Error loading grade-specific data:', error)
    console.log('Falling back to comprehensive data...')
    return loadComprehensiveData()
  }
}

// Fallback function to load comprehensive data
async function loadComprehensiveData(): Promise<AppData> {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'questions')
    const comprehensiveFile = path.join(dataDir, 'comprehensive-questions.json')
    
    if (fs.existsSync(comprehensiveFile)) {
      const fileContent = fs.readFileSync(comprehensiveFile, 'utf8')
      const data = JSON.parse(fileContent)
      const validatedData = DataSchema.parse(data)
      
      console.log('📋 Loaded comprehensive data as fallback')
      
      return {
        questions: validatedData.questions,
        sets: validatedData.sets
      }
    }
    
    throw new Error('No data files found')
  } catch (error) {
    console.error('Error loading comprehensive data:', error)
    return { questions: [], sets: [] }
  }
}

// Get subjects with their data
export async function getSubjectData() {
  const data = await getStaticAppData()
  
  const subjects = {
    math: {
      questions: data.questions.filter(q => q.subject === 'math'),
      sets: data.sets.filter(s => s.subject === 'math'),
      topics: [...new Set(data.questions.filter(q => q.subject === 'math').map(q => q.topic))]
    },
    english: {
      questions: data.questions.filter(q => q.subject === 'english'),
      sets: data.sets.filter(s => s.subject === 'english'),
      topics: [...new Set(data.questions.filter(q => q.subject === 'english').map(q => q.topic))]
    },
    science: {
      questions: data.questions.filter(q => q.subject === 'science'),
      sets: data.sets.filter(s => s.subject === 'science'),
      topics: [...new Set(data.questions.filter(q => q.subject === 'science').map(q => q.topic))]
    }
  }
  
  return subjects
}

// Get all available subjects for static generation
export async function getAvailableSubjects(): Promise<string[]> {
  const data = await getStaticAppData()
  return [...new Set(data.questions.map(q => q.subject))]
}

// Get all available set IDs for static generation
export async function getAvailableSetIds(): Promise<string[]> {
  const data = await getStaticAppData()
  return data.sets.map(s => s.id)
}

// Helper function to shuffle an array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Get specific set data
export async function getSetData(setId: string) {
  const data = await getStaticAppData()
  const set = data.sets.find(s => s.id === setId)
  
  if (!set) return null
  
  // Get all questions for this set
  const allQuestions = data.questions.filter(q => set.questionIds.includes(q.id))
  
  // Shuffle and take first 20 questions (or all if less than 20)
  const questions = allQuestions.length <= 20 
    ? allQuestions 
    : shuffleArray(allQuestions).slice(0, 20)
  
  return {
    set: {
      ...set,
      // Update the questionIds to only include the selected questions
      questionIds: questions.map(q => q.id)
    },
    questions
  }
}

// Grade management functions
export async function getAvailableGrades(): Promise<number[]> {
  const dataDir = path.join(process.cwd(), 'data', 'questions')
  const entries = fs.readdirSync(dataDir, { withFileTypes: true })
  
  const grades = entries
    .filter(entry => entry.isDirectory() && entry.name.startsWith('grade-'))
    .map(entry => parseInt(entry.name.replace('grade-', '')))
    .filter(grade => !isNaN(grade))
    .sort()
  
  return grades
}

export async function getGradeData(grade: number): Promise<AppData> {
  const gradeDir = path.join(process.cwd(), 'data', 'questions', `grade-${grade}`)
  
  if (!fs.existsSync(gradeDir)) {
    throw new Error(`Grade ${grade} data not found`)
  }
  
  const allQuestions: Question[] = []
  const allSets: QuestionSet[] = []
  
  const subjects = ['math', 'english', 'science']
  
  for (const subject of subjects) {
    const subjectFile = path.join(gradeDir, subject, `${subject}-questions.json`)
    
    if (fs.existsSync(subjectFile)) {
      const fileContent = fs.readFileSync(subjectFile, 'utf8')
      const data = JSON.parse(fileContent)
      const validatedData = DataSchema.parse(data)
      
      allQuestions.push(...validatedData.questions)
      allSets.push(...validatedData.sets)
    }
  }
  
  return {
    questions: allQuestions,
    sets: allSets
  }
}

// Get grade metadata (computed from actual data)
export async function getGradeMetadata(grade: number) {
  const gradeData = await getGradeData(grade)
  
  const subjects = ['math', 'english', 'science']
  const questionCounts: Record<string, number> = {}
  
  subjects.forEach(subject => {
    questionCounts[subject] = gradeData.questions.filter(q => q.subject === subject).length
  })
  
  return {
    grade,
    totalQuestions: gradeData.questions.length,
    totalSets: gradeData.sets.length,
    subjects,
    questionCounts,
    generatedAt: new Date().toISOString(),
    description: `Grade ${grade} content for YAYA's learning platform`
  }
}
