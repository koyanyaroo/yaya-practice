'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { QuestionRenderer } from "@/components/ui/question-renderer"
import { ArrowLeft, ArrowRight, Home, Star, Clock, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { Question, Answer, QuestionSet, QuestionAttempt } from "@/types"
import { getCurrentProfile, addQuestionAttempt } from "@/lib/persistence"
import { shuffleArray } from "@/lib/utils"
import { scoreQuestion } from "@/lib/scoring"
import { getPersonalizedMessage, getUserName, PERSONALIZATION } from "@/lib/personalization"

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

interface PlayClientProps {
  initialSet: QuestionSet
  initialQuestions: Question[]
}

function getScoreStars(accuracy: number): number {
  if (accuracy >= 90) return 3
  if (accuracy >= 70) return 2
  if (accuracy >= 50) return 1
  return 0
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export function PlayClient({ initialSet, initialQuestions }: PlayClientProps) {
  const [quizState, setQuizState] = useState<QuizState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Shuffle questions if recommended
    const orderedQuestions = initialSet.recommendedOrder === 'random' 
      ? shuffleArray(initialQuestions) 
      : initialQuestions

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

    setQuizState(initialState)
    setLoading(false)
  }, [initialSet, initialQuestions])

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
    if (!quizState) return
    
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
      addQuestionAttempt(profile.id, initialSet.id, attempt)
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

    // Show personalized toast messages for YAYA
    if (scoreResult.isCorrect) {
      const personalizedMessage = getPersonalizedMessage('motivational')
      toast.success(personalizedMessage)
    } else {
      const encouragement = PERSONALIZATION.messages.achievements.encouragement
      toast.error(encouragement)
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

  if (loading || !quizState) {
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
            
            <h1 className="kid-heading">
              {accuracy >= 90 ? PERSONALIZATION.messages.achievements.excellent :
               accuracy >= 70 ? PERSONALIZATION.messages.achievements.good :
               PERSONALIZATION.messages.achievements.improving}
            </h1>
            
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
              
              <div className="text-sm text-primary font-medium mt-2">
                {accuracy >= 80 ? `${getUserName()}, you're amazing! ${PERSONALIZATION.user.parentName} would be so proud! 💖` :
                 accuracy >= 60 ? `Well done, ${getUserName()}! You're learning so well! 🌟` :
                 `Keep practicing, ${getUserName()}! Every try makes you smarter! 💪`}
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
                <h1 className="font-semibold">
                  Question {quizState.currentQuestionIndex + 1} of {Math.min(20, quizState.totalQuestions)}
                  {initialQuestions.length > 20 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (from {initialQuestions.length} available)
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">Score: {quizState.score}/{Math.min(20, quizState.totalQuestions)}</p>
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
