"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { QuestionRenderer } from "@/components/ui/question-renderer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  RotateCcw, 
  CheckCircle, 
  Award,
  Clock,
  Star
} from "lucide-react"
import { getAppData, getCurrentProfile, addQuestionAttempt } from "@/lib/persistence"
import { AppData, Question, Answer, QuestionAttempt } from "@/types"
import { scoreQuestion } from "@/lib/scoring"
import { shuffleArray, formatTime, getScoreStars } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

interface QuizState {
  currentQuestionIndex: number
  questions: Question[]
  userAnswers: { [questionId: string]: Answer }
  attempts: { [questionId: string]: QuestionAttempt }
  showHint: { [questionId: string]: boolean }
  showFeedback: { [questionId: string]: boolean }
  feedback: { [questionId: string]: string }
  isCompleted: boolean
  score: number
  totalQuestions: number
  timeStarted: Date
  questionStartTime: Date
}

export default function QuizPlayerPage() {
  const params = useParams()
  const router = useRouter()
  const setId = params.setId as string
  
  const [appData, setAppData] = useState<AppData | null>(null)
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = getAppData()
    if (!data) {
      toast.error("No practice data found!")
      router.push("/")
      return
    }

    const set = data.sets.find(s => s.id === setId)
    if (!set) {
      toast.error("Practice set not found!")
      router.push("/")
      return
    }

    const questions = data.questions.filter(q => set.questionIds.includes(q.id))
    if (questions.length === 0) {
      toast.error("No questions found in this set!")
      router.push("/")
      return
    }

    // Shuffle questions if recommended
    const orderedQuestions = set.recommendedOrder === 'random' 
      ? shuffleArray(questions) 
      : questions

    const initialState: QuizState = {
      currentQuestionIndex: 0,
      questions: orderedQuestions,
      userAnswers: {},
      attempts: {},
      showHint: {},
      showFeedback: {},
      feedback: {},
      isCompleted: false,
      score: 0,
      totalQuestions: orderedQuestions.length,
      timeStarted: new Date(),
      questionStartTime: new Date()
    }

    setAppData(data)
    setQuizState(initialState)
    setLoading(false)
  }, [setId, router])

  const handleAnswerChange = (answer: Answer) => {
    if (!quizState) return
    
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex]
    
    // For MCQ questions, we need to convert choice ID to choice text for comparison
    let processedAnswer = answer
    if (currentQuestion.type === 'mcq_single' && typeof answer === 'string') {
      const choice = currentQuestion.choices?.find(c => c.id === answer)
      if (choice) {
        processedAnswer = choice.text
      }
    }
    
    setQuizState(prev => ({
      ...prev!,
      userAnswers: {
        ...prev!.userAnswers,
        [currentQuestion.id]: processedAnswer
      }
    }))
  }

  const handleSubmitAnswer = () => {
    if (!quizState || !appData) return
    
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex]
    const userAnswer = quizState.userAnswers[currentQuestion.id]
    
    if (!userAnswer) {
      toast.error("Please provide an answer!")
      return
    }

    const scoreResult = scoreQuestion(currentQuestion, userAnswer)
    const timeSpent = Date.now() - quizState.questionStartTime.getTime()
    const hintsUsed = quizState.showHint[currentQuestion.id] ? 1 : 0

    const attempt: QuestionAttempt = {
      questionId: currentQuestion.id,
      isCorrect: scoreResult.isCorrect,
      userAnswer,
      timeSpent: Math.round(timeSpent / 1000), // Convert to seconds
      hintsUsed,
      timestamp: new Date()
    }

    // Save attempt to profile if logged in
    const profile = getCurrentProfile()
    if (profile) {
      addQuestionAttempt(profile.id, setId, attempt)
    }

    // Update quiz state
    setQuizState(prev => ({
      ...prev!,
      attempts: {
        ...prev!.attempts,
        [currentQuestion.id]: attempt
      },
      showFeedback: {
        ...prev!.showFeedback,
        [currentQuestion.id]: true
      },
      feedback: {
        ...prev!.feedback,
        [currentQuestion.id]: scoreResult.feedback
      },
      score: prev!.score + (scoreResult.isCorrect ? 1 : 0)
    }))

    // Show toast with actual feedback from scoring function
    if (scoreResult.isCorrect) {
      toast.success(scoreResult.feedback)
    } else {
      toast.error(scoreResult.feedback)
    }
  }

  const handleNextQuestion = () => {
    if (!quizState) return
    
    const nextIndex = quizState.currentQuestionIndex + 1
    if (nextIndex >= quizState.questions.length) {
      // Quiz completed
      setQuizState(prev => ({
        ...prev!,
        isCompleted: true
      }))
    } else {
      setQuizState(prev => ({
        ...prev!,
        currentQuestionIndex: nextIndex,
        questionStartTime: new Date()
      }))
    }
  }

  const handlePreviousQuestion = () => {
    if (!quizState) return
    
    const prevIndex = quizState.currentQuestionIndex - 1
    if (prevIndex >= 0) {
      setQuizState(prev => ({
        ...prev!,
        currentQuestionIndex: prevIndex,
        questionStartTime: new Date()
      }))
    }
  }

  const handleShowHint = () => {
    if (!quizState) return
    
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex]
    setQuizState(prev => ({
      ...prev!,
      showHint: {
        ...prev!.showHint,
        [currentQuestion.id]: true
      }
    }))
  }

  const handleRestart = () => {
    if (!quizState) return
    
    setQuizState(prev => ({
      ...prev!,
      currentQuestionIndex: 0,
      userAnswers: {},
      attempts: {},
      showHint: {},
      showFeedback: {},
      feedback: {},
      isCompleted: false,
      score: 0,
      timeStarted: new Date(),
      questionStartTime: new Date()
    }))
  }

  if (loading || !quizState || !appData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="kid-text text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex]
  const currentAttempt = quizState.attempts[currentQuestion.id]
  const isAnswered = !!currentAttempt
  const showFeedback = quizState.showFeedback[currentQuestion.id]
  const userAnswer = quizState.userAnswers[currentQuestion.id]
  const progress = ((quizState.currentQuestionIndex + (isAnswered ? 1 : 0)) / quizState.totalQuestions) * 100

  if (quizState.isCompleted) {
    const accuracy = Math.round((quizState.score / quizState.totalQuestions) * 100)
    const stars = getScoreStars(accuracy)
    const totalTime = Math.round((Date.now() - quizState.timeStarted.getTime()) / 1000)
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            
            <h1 className="kid-heading">Great Job!</h1>
            
            <div className="space-y-4">
              <div className="text-2xl font-bold text-primary">
                {quizState.score}/{quizState.totalQuestions}
              </div>
              <div className="text-lg text-muted-foreground">
                {accuracy}% correct
              </div>
              
              <div className="flex justify-center gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-8 w-8 ${i < stars ? 'text-yellow-500 fill-current animate-star-twinkle' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Completed in {formatTime(totalTime)}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleRestart} variant="outline" className="kid-button">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Link href="/" className="flex-1">
                <Button className="w-full kid-button">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="icon" className="focus-ring">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="font-semibold">Question {quizState.currentQuestionIndex + 1} of {quizState.totalQuestions}</h1>
                <p className="text-sm text-muted-foreground">Score: {quizState.score}/{quizState.totalQuestions}</p>
              </div>
            </div>
            
            <Badge variant="outline" className="text-kid-sm">
              {currentQuestion.subject}
            </Badge>
          </div>
          
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <QuestionRenderer
          question={currentQuestion}
          userAnswer={userAnswer}
          onAnswerChange={handleAnswerChange}
          onSubmit={handleSubmitAnswer}
          showFeedback={showFeedback}
          feedback={quizState.feedback[currentQuestion.id]}
          isCorrect={currentAttempt?.isCorrect}
          showHint={quizState.showHint[currentQuestion.id]}
          onRequestHint={currentQuestion.hint ? handleShowHint : undefined}
          disabled={showFeedback}
        />

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={quizState.currentQuestionIndex === 0}
            className="kid-button"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {isAnswered && (
            <Button
              onClick={handleNextQuestion}
              className="kid-button"
            >
              {quizState.currentQuestionIndex === quizState.questions.length - 1 ? "Finish" : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
