import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Subject } from "@/types"
import { getSubjectColor } from "@/lib/utils"
import { Calculator, BookOpen, FlaskConical } from "lucide-react"
import Link from "next/link"

interface SubjectCardProps {
  subject: Subject
  title: string
  description: string
  topicCount: number
  completedCount?: number
}

const subjectIcons = {
  math: Calculator,
  english: BookOpen,
  science: FlaskConical,
}

const subjectThemes = {
  math: "math-theme",
  english: "english-theme", 
  science: "science-theme",
}

export function SubjectCard({ 
  subject, 
  title, 
  description, 
  topicCount, 
  completedCount = 0 
}: SubjectCardProps) {
  const Icon = subjectIcons[subject]
  const themeClass = subjectThemes[subject]
  const progress = topicCount > 0 ? (completedCount / topicCount) * 100 : 0
  
  return (
    <Card className={`kid-card hover:scale-105 transition-transform duration-200 ${themeClass} cursor-pointer`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-4 rounded-full bg-white/80">
          <Icon className="h-12 w-12" />
        </div>
        <CardTitle className="kid-heading">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="kid-text text-center">{description}</p>
        
        <div className="flex justify-center gap-2">
          <Badge variant="secondary" className="text-kid-sm">
            {topicCount} topics
          </Badge>
          {completedCount > 0 && (
            <Badge variant="success" className="text-kid-sm">
              {completedCount} completed
            </Badge>
          )}
        </div>
        
        {progress > 0 && (
          <div className="w-full bg-white/50 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        <Link href={`/practice/${subject}`} className="w-full block">
          <Button className="w-full kid-button bg-white/90 hover:bg-white text-current">
            Start Learning
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
