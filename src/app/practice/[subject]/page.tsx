"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Play, Star, Clock, Target } from "lucide-react"
import { getAppData } from "@/lib/persistence"
import { Subject, AppData, QuestionSet } from "@/types"
import { getSubjectColor, formatTime } from "@/lib/utils"
import Link from "next/link"

export default function SubjectPracticePage() {
  const params = useParams()
  const router = useRouter()
  const subject = params.subject as Subject
  const [appData, setAppData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const data = getAppData()
    if (data) {
      setAppData(data)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="kid-text text-muted-foreground">Loading practice sets...</p>
        </div>
      </div>
    )
  }

  if (!appData || !['math', 'english', 'science'].includes(subject)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="kid-heading">Oops!</h1>
          <p className="kid-text text-muted-foreground">We couldn't find that subject.</p>
          <Link href="/">
            <Button className="kid-button">Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  const subjectSets = appData.sets.filter(set => set.subject === subject)
  const subjectQuestions = appData.questions.filter(q => q.subject === subject)
  const topics = [...new Set(subjectQuestions.map(q => q.topic))]

  const subjectInfo = {
    math: {
      title: "Math",
      description: "Numbers, shapes, and problem solving fun!",
      color: "math-500",
      bgColor: "math-50",
      borderColor: "math-200"
    },
    english: {
      title: "English", 
      description: "Reading, writing, and language adventures!",
      color: "english-500",
      bgColor: "english-50",
      borderColor: "english-200"
    },
    science: {
      title: "Science",
      description: "Explore the world around you!",
      color: "science-500", 
      bgColor: "science-50",
      borderColor: "science-200"
    }
  }

  const info = subjectInfo[subject]

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="outline" size="icon" className="focus-ring">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className={`text-4xl font-bold text-${info.color} mb-2`}>{info.title}</h1>
          <p className="text-xl text-muted-foreground">{info.description}</p>
        </div>
      </div>

      {/* Subject Overview */}
      <Card className={`mb-8 bg-${info.bgColor} border-${info.borderColor}`}>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold text-${info.color} mb-1`}>
                {subjectSets.length}
              </div>
              <div className="text-sm text-muted-foreground">Practice Sets</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold text-${info.color} mb-1`}>
                {topics.length}
              </div>
              <div className="text-sm text-muted-foreground">Topics</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold text-${info.color} mb-1`}>
                {subjectQuestions.length}
              </div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practice Sets */}
      <div className="space-y-4">
        <h2 className="kid-heading">Choose a Practice Set</h2>
        
        {subjectSets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="kid-text text-muted-foreground">
                No practice sets available for {info.title} yet.
              </p>
              <Link href="/upload" className="mt-4 inline-block">
                <Button className="kid-button">Upload Questions</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {subjectSets.map((set) => (
              <SetCard key={set.id} set={set} questions={subjectQuestions} />
            ))}
          </div>
        )}
      </div>

      {/* Topics Overview */}
      <div className="mt-12">
        <h2 className="kid-heading">Topics in {info.title}</h2>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Badge key={topic} variant="outline" className="text-kid-sm">
              {topic}
            </Badge>
          ))}
        </div>
      </div>
    </main>
  )
}

function SetCard({ set, questions }: { set: QuestionSet; questions: any[] }) {
  const setQuestions = questions.filter(q => set.questionIds.includes(q.id))
  const avgDifficulty = setQuestions.length > 0 
    ? setQuestions.filter(q => q.difficulty).reduce((acc, q) => {
        const difficulty = q.difficulty === 'easy' ? 1 : q.difficulty === 'medium' ? 2 : 3
        return acc + difficulty
      }, 0) / setQuestions.filter(q => q.difficulty).length
    : 1

  const difficultyLabel = avgDifficulty <= 1.5 ? 'Easy' : avgDifficulty <= 2.5 ? 'Medium' : 'Hard'
  const difficultyColor = avgDifficulty <= 1.5 ? 'text-green-600' : avgDifficulty <= 2.5 ? 'text-yellow-600' : 'text-red-600'

  // TODO: Get actual progress from user data
  const progress = 0
  const stars = 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="kid-text font-semibold mb-2">{set.title}</h3>
            {set.description && (
              <p className="text-sm text-muted-foreground mb-3">{set.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="text-kid-sm">
                {setQuestions.length} questions
              </Badge>
              <Badge variant="outline" className={`text-kid-sm ${difficultyColor}`}>
                {difficultyLabel}
              </Badge>
              {set.timeLimitSeconds && (
                <Badge variant="outline" className="text-kid-sm">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(set.timeLimitSeconds)}
                </Badge>
              )}
            </div>

            {progress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="flex-1" />
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < stars ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href={`/play/${set.id}`} className="flex-1">
            <Button className="w-full kid-button">
              <Play className="h-4 w-4 mr-2" />
              Start Practice
            </Button>
          </Link>
          {progress > 0 && (
            <Button variant="outline" className="kid-button">
              <Target className="h-4 w-4 mr-2" />
              Review
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
