"use client"

import { useEffect, useState } from "react"
import { SubjectCard } from "@/components/ui/subject-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import { getAppData, saveAppData } from "@/lib/persistence"
import { initializeAppData } from "@/lib/data-initializer"
import { AppData } from "@/types"
import Link from "next/link"

export default function Home() {
  const [appData, setAppData] = useState<AppData | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
    
    // Add keyboard shortcut to show admin menu (Ctrl + Shift + A)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault()
        setShowAdminMenu(prev => !prev)
      }
    }
    
    document.addEventListener('keydown', handleKeyPress)
    
    // Initialize app data from our JSON files
    initializeAppData().then((success) => {
      if (success) {
        const data = getAppData()
        if (data) {
          setAppData(data)
        }
      } else {
        console.error('Failed to initialize app data')
        const emptyData: AppData = { questions: [], sets: [] }
        saveAppData(emptyData)
        setAppData(emptyData)
      }
    })
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('high-contrast')
    else setTheme('light')
  }

  if (!mounted || !appData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="kid-text text-muted-foreground">Loading your practice sessions...</p>
        </div>
      </div>
    )
  }

  // Count topics and sets by subject
  const subjectStats = {
    math: {
      topics: [...new Set(appData.questions.filter(q => q.subject === 'math').map(q => q.topic))].length,
      sets: appData.sets.filter(s => s.subject === 'math').length
    },
    english: {
      topics: [...new Set(appData.questions.filter(q => q.subject === 'english').map(q => q.topic))].length,
      sets: appData.sets.filter(s => s.subject === 'english').length
    },
    science: {
      topics: [...new Set(appData.questions.filter(q => q.subject === 'science').map(q => q.topic))].length,
      sets: appData.sets.filter(s => s.subject === 'science').length
    }
  }

  return (
    <main id="main-content" className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">YaYa Practice</h1>
          <p className="text-xl text-muted-foreground">Fun learning for elementary students!</p>
        </div>
        
        {/* Admin menu - hidden by default, shown with Ctrl+Shift+A */}
        {showAdminMenu && (
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 bg-orange-50">
              Admin Mode
            </Badge>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={cycleTheme}
              className="focus-ring"
              title="Change theme"
            >
              {theme === 'light' && <Sun className="h-4 w-4" />}
              {theme === 'dark' && <Moon className="h-4 w-4" />}
              {theme === 'high-contrast' && <Palette className="h-4 w-4" />}
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="focus-ring" title="Settings & Dashboard">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/test">
              <Button variant="outline" className="focus-ring" title="Test Data">
                Test Data
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Welcome Message */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="kid-heading text-center">Welcome to Learning Fun!</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="kid-text mb-4">
            Choose a subject to start practicing. Each question is designed to help you learn and grow!
          </p>
          <p className="kid-text text-primary font-semibold">
            Let&apos;s have fun learning together! 🎉
          </p>
        </CardContent>
      </Card>

      {/* Subject Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <SubjectCard
          subject="math"
          title="Math"
          description="Numbers, shapes, and problem solving fun!"
          topicCount={subjectStats.math.topics}
          completedCount={0} // TODO: Calculate from progress
        />
        
        <SubjectCard
          subject="english"
          title="English"
          description="Reading, writing, and language adventures!"
          topicCount={subjectStats.english.topics}
          completedCount={0} // TODO: Calculate from progress
        />
        
        <SubjectCard
          subject="science"
          title="Science"
          description="Explore the world around you!"
          topicCount={subjectStats.science.topics}
          completedCount={0} // TODO: Calculate from progress
        />
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-math-500 mb-1">{subjectStats.math.sets}</div>
            <div className="text-sm text-muted-foreground">Math Sets</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-english-500 mb-1">{subjectStats.english.sets}</div>
            <div className="text-sm text-muted-foreground">English Sets</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-science-500 mb-1">{subjectStats.science.sets}</div>
            <div className="text-sm text-muted-foreground">Science Sets</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Admin access instructions - hidden but accessible */}
      {!showAdminMenu && (
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground opacity-30 hover:opacity-100 transition-opacity duration-300">
            For administrators: Press Ctrl+Shift+A to access settings
          </p>
        </div>
      )}
    </main>
  )
}
