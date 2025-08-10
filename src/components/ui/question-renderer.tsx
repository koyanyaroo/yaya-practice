"use client"

import { useState } from "react"
import Image from "next/image"
import { Question, Answer } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, Volume2, Lightbulb } from "lucide-react"
import { speakText } from "@/lib/utils"

interface QuestionRendererProps {
  question: Question
  userAnswer?: Answer
  onAnswerChange: (answer: Answer) => void
  onSubmit: () => void
  showFeedback?: boolean
  feedback?: string
  isCorrect?: boolean
  showHint?: boolean
  onRequestHint?: () => void
  disabled?: boolean
}

export function QuestionRenderer({
  question,
  userAnswer,
  onAnswerChange,
  onSubmit,
  showFeedback,
  feedback,
  isCorrect,
  showHint,
  onRequestHint,
  disabled = false
}: QuestionRendererProps) {
  const [draggedItems, setDraggedItems] = useState<{ [key: string]: string }>({})

  const handleSpeakPrompt = () => {
    speakText(question.prompt)
  }

  const renderChoices = () => {
    if (!question.choices) return null

    switch (question.type) {
      case 'mcq_single':
        return (
          <div className="space-y-3">
            {question.choices.map((choice) => {
              // Check both choice.id and choice.text for selection since answer might be processed
              const isSelected = userAnswer === choice.id || userAnswer === choice.text
              return (
                <Button
                  key={choice.id}
                  variant="outline"
                  className={`w-full justify-start text-left h-auto p-4 transition-all duration-200 hover:scale-[1.02] ${
                    isSelected 
                      ? 'bg-blue-100 border-blue-500 text-blue-900 shadow-md hover:bg-blue-200' 
                      : 'hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => onAnswerChange(choice.id)}
                  disabled={disabled}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      isSelected 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {String.fromCharCode(65 + question.choices!.indexOf(choice))}
                    </span>
                    <span className="flex-1">{choice.text}</span>
                  </span>
                </Button>
              )
            })}
          </div>
        )

      case 'mcq_multi':
        const multiAnswers = Array.isArray(userAnswer) ? userAnswer as string[] : []
        return (
          <div className="space-y-3">
            {question.choices.map((choice) => {
              const isSelected = multiAnswers.includes(choice.id)
              return (
                <Button
                  key={choice.id}
                  variant="outline"
                  className={`w-full justify-start text-left h-auto p-4 transition-all duration-200 hover:scale-[1.02] ${
                    isSelected 
                      ? 'bg-green-100 border-green-500 text-green-900 shadow-md hover:bg-green-200' 
                      : 'hover:bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    const newAnswers = multiAnswers.includes(choice.id)
                      ? multiAnswers.filter(id => id !== choice.id)
                      : [...multiAnswers, choice.id]
                    onAnswerChange(newAnswers)
                  }}
                  disabled={disabled}
                >
                  <span className="flex items-center gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      isSelected 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isSelected ? "✓" : String.fromCharCode(65 + question.choices!.indexOf(choice))}
                    </span>
                    <span className="flex-1">{choice.text}</span>
                  </span>
                </Button>
              )
            })}
          </div>
        )

      case 'true_false':
        return (
          <div className="flex gap-4">
            <Button
              variant="outline"
              className={`flex-1 h-16 transition-all duration-200 hover:scale-[1.02] ${
                userAnswer === true 
                  ? 'bg-green-100 border-green-500 text-green-900 shadow-md hover:bg-green-200' 
                  : 'hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => onAnswerChange(true)}
              disabled={disabled}
            >
              <CheckCircle2 className={`h-6 w-6 mr-2 ${
                userAnswer === true ? 'text-green-600' : 'text-gray-500'
              }`} />
              True
            </Button>
            <Button
              variant="outline"
              className={`flex-1 h-16 transition-all duration-200 hover:scale-[1.02] ${
                userAnswer === false 
                  ? 'bg-red-100 border-red-500 text-red-900 shadow-md hover:bg-red-200' 
                  : 'hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => onAnswerChange(false)}
              disabled={disabled}
            >
              <XCircle className={`h-6 w-6 mr-2 ${
                userAnswer === false ? 'text-red-600' : 'text-gray-500'
              }`} />
              False
            </Button>
          </div>
        )

      case 'order':
        const orderAnswers = Array.isArray(userAnswer) ? userAnswer as string[] : []
        const remainingChoices = question.choices.filter(choice => !orderAnswers.includes(choice.id))
        
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">Drag items to order them:</p>
              <div className="flex flex-wrap gap-2">
                {remainingChoices.map((choice) => (
                  <Badge
                    key={choice.id}
                    variant="outline"
                    className="cursor-move p-2 text-kid-sm hover:bg-primary hover:text-primary-foreground"
                    draggable
                    onDragStart={() => setDraggedItems({...draggedItems, dragging: choice.id})}
                  >
                    {choice.text}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-2 border-dashed border-muted-foreground/50 rounded-lg min-h-20">
              <p className="text-sm text-muted-foreground mb-2">Your order:</p>
              <div className="space-y-2">
                {orderAnswers.map((choiceId, index) => {
                  const choice = question.choices!.find(c => c.id === choiceId)
                  return (
                    <div key={choiceId} className="flex items-center gap-2">
                      <span className="text-sm font-medium">{index + 1}.</span>
                      <Badge variant="default" className="text-kid-sm">
                        {choice?.text}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newOrder = orderAnswers.filter(id => id !== choiceId)
                          onAnswerChange(newOrder)
                        }}
                        disabled={disabled}
                      >
                        ×
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="kid-card">
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="text-kid-sm">
                {question.topic}
              </Badge>
              {question.difficulty && (
                <Badge variant="secondary" className="text-kid-sm">
                  {question.difficulty}
                </Badge>
              )}
            </div>
            
            <div className="flex items-start gap-3">
              <h2 className="kid-text flex-1">{question.prompt}</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSpeakPrompt}
                className="flex-shrink-0"
                disabled={disabled}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            
            {question.media?.imageUrl && (
              <div className="mt-4 relative w-full h-64">
                <Image
                  src={question.media.imageUrl}
                  alt="Question illustration"
                  fill
                  className="object-contain rounded-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
          </div>
        </div>

        {question.type === 'short_answer' || question.type === 'fill_blank' ? (
          <Input
            placeholder="Type your answer here..."
            value={typeof userAnswer === 'string' ? userAnswer : ''}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="kid-button text-kid-base"
            disabled={disabled}
          />
        ) : (
          renderChoices()
        )}

        <div className="flex gap-3">
          {onRequestHint && (
            <Button
              variant="outline"
              onClick={onRequestHint}
              disabled={disabled || showHint}
              className="kid-button"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              {showHint ? 'Hint shown' : 'Get hint'}
            </Button>
          )}
          
          <Button
            onClick={onSubmit}
            disabled={disabled || !userAnswer}
            className="kid-button flex-1"
          >
            Submit Answer
          </Button>
        </div>

        {showHint && question.hint && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Hint</span>
              </div>
              <p className="text-sm text-yellow-700">{question.hint}</p>
            </CardContent>
          </Card>
        )}

        {showFeedback && feedback && (
          <Card className={isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? 'Correct!' : 'Not quite right'}
                </span>
              </div>
              <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {feedback}
              </p>
              {!isCorrect && question.explanation && (
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
