"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAppData, clearAllData } from "@/lib/persistence"
import { initializeAppData, resetAndReloadData } from "@/lib/data-initializer"
import { AppData } from "@/types"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Trash2, Database } from "lucide-react"

export default function TestPage() {
  const [appData, setAppData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  const loadData = () => {
    const data = getAppData()
    setAppData(data)
    setStatus(data ? `Loaded ${data.questions.length} questions and ${data.sets.length} sets` : "No data found")
  }

  const handleInitialize = async () => {
    setLoading(true)
    setStatus("Initializing data from JSON files...")
    
    const success = await initializeAppData()
    if (success) {
      loadData()
      setStatus("✅ Data initialized successfully!")
    } else {
      setStatus("❌ Failed to initialize data")
    }
    setLoading(false)
  }

  const handleReset = async () => {
    setLoading(true)
    setStatus("Resetting and reloading data...")
    
    const success = await resetAndReloadData()
    if (success) {
      loadData()
      setStatus("✅ Data reset and reloaded successfully!")
    } else {
      setStatus("❌ Failed to reset data")
    }
    setLoading(false)
  }

  const handleClear = () => {
    clearAllData()
    setAppData(null)
    setStatus("🗑️ All data cleared")
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Data Test Page</h1>
          <p className="text-muted-foreground">Test and debug the question data loading</p>
        </div>
      </div>

      {/* Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`font-mono text-sm p-3 rounded ${
            status.includes('✅') ? 'bg-green-100 text-green-800' :
            status.includes('❌') ? 'bg-red-100 text-red-800' :
            status.includes('🗑️') ? 'bg-orange-100 text-orange-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {status || "Click a button to test data operations"}
          </p>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleInitialize} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Initialize Data
            </Button>
            
            <Button 
              onClick={handleReset} 
              disabled={loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset & Reload
            </Button>
            
            <Button 
              onClick={handleClear} 
              disabled={loading}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>

            <Button 
              onClick={loadData} 
              disabled={loading}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Summary */}
      {appData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{appData.questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{appData.sets.length}</div>
                <div className="text-sm text-muted-foreground">Sets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {[...new Set(appData.questions.map(q => q.topic))].length}
                </div>
                <div className="text-sm text-muted-foreground">Topics</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="font-semibold mb-2">By Subject:</h4>
                <div className="flex flex-wrap gap-2">
                  {['math', 'english', 'science'].map(subject => {
                    const count = appData.questions.filter(q => q.subject === subject).length
                    return (
                      <Badge key={subject} variant="outline">
                        {subject}: {count} questions
                      </Badge>
                    )
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Sets:</h4>
                <div className="flex flex-wrap gap-2">
                  {appData.sets.map(set => (
                    <Badge key={set.id} variant="secondary">
                      {set.title} ({set.questionIds.length} questions)
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Question */}
      {appData && appData.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Question</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>ID:</strong> {appData.questions[0].id}</div>
              <div><strong>Subject:</strong> {appData.questions[0].subject}</div>
              <div><strong>Topic:</strong> {appData.questions[0].topic}</div>
              <div><strong>Question:</strong> {appData.questions[0].prompt}</div>
              {appData.questions[0].choices && (
                <div>
                  <strong>Options:</strong>
                  <ul className="list-disc ml-6">
                    {appData.questions[0].choices.map((choice, index) => (
                      <li key={choice.id}>
                        {choice.text} {choice.text === appData.questions[0].answer && "✓"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
