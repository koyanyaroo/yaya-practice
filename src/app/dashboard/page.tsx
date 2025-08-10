"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Trash2,
  Download,
  AlertTriangle
} from "lucide-react"
import { DataSchema, AppData } from "@/types"
import { getAppData, saveAppData, getUploadedData, addUploadedData, clearAllData } from "@/lib/persistence"
import { toast } from "sonner"
import Link from "next/link"
import { ZodError } from "zod"

interface ValidationError {
  path: string[]
  message: string
}

export default function DashboardPage() {
  const [appData, setAppData] = useState<AppData | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<AppData[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load data on component mount
  useEffect(() => {
    const data = getAppData()
    if (data) setAppData(data)
    
    const uploaded = getUploadedData()
    setUploadedFiles(uploaded)
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setValidationErrors([])

    try {
      const text = await file.text()
      const jsonData = JSON.parse(text)
      
      // Validate with Zod schema
      const validatedData = DataSchema.parse(jsonData)
      
      // Check for duplicate IDs
      const questionIds = validatedData.questions.map(q => q.id)
      const setIds = validatedData.sets.map(s => s.id)
      const duplicateQuestionIds = questionIds.filter((id, index) => questionIds.indexOf(id) !== index)
      const duplicateSetIds = setIds.filter((id, index) => setIds.indexOf(id) !== index)
      
      if (duplicateQuestionIds.length > 0 || duplicateSetIds.length > 0) {
        throw new Error(`Duplicate IDs found: ${[...duplicateQuestionIds, ...duplicateSetIds].join(', ')}`)
      }

      // Validate question references in sets
      const allQuestionIds = new Set(questionIds)
      for (const set of validatedData.sets) {
        const missingQuestions = set.questionIds.filter(id => !allQuestionIds.has(id))
        if (missingQuestions.length > 0) {
          throw new Error(`Set "${set.title}" references non-existent questions: ${missingQuestions.join(', ')}`)
        }
      }

      // If validation passes, merge with existing data
      const currentData = getAppData()
      if (currentData) {
        // Check for conflicts with existing data
        const existingQuestionIds = new Set(currentData.questions.map(q => q.id))
        const existingSetIds = new Set(currentData.sets.map(s => s.id))
        
        const conflictingQuestions = validatedData.questions.filter(q => existingQuestionIds.has(q.id))
        const conflictingSets = validatedData.sets.filter(s => existingSetIds.has(s.id))
        
        if (conflictingQuestions.length > 0 || conflictingSets.length > 0) {
          const shouldReplace = confirm(
            `Found ${conflictingQuestions.length + conflictingSets.length} items with existing IDs. Replace them?`
          )
          
          if (!shouldReplace) {
            toast.error("Upload cancelled - conflicts detected")
            return
          }
          
          // Remove conflicting items from current data
          const filteredQuestions = currentData.questions.filter(q => 
            !validatedData.questions.some(newQ => newQ.id === q.id)
          )
          const filteredSets = currentData.sets.filter(s => 
            !validatedData.sets.some(newS => newS.id === s.id)
          )
          
          const mergedData: AppData = {
            questions: [...filteredQuestions, ...validatedData.questions],
            sets: [...filteredSets, ...validatedData.sets]
          }
          
          saveAppData(mergedData)
          setAppData(mergedData)
        } else {
          // No conflicts, simple merge
          const mergedData: AppData = {
            questions: [...currentData.questions, ...validatedData.questions],
            sets: [...currentData.sets, ...validatedData.sets]
          }
          
          saveAppData(mergedData)
          setAppData(mergedData)
        }
      } else {
        // No existing data, just save
        saveAppData(validatedData)
        setAppData(validatedData)
      }
      
      // Save to uploaded files history
      addUploadedData(validatedData)
      setUploadedFiles(prev => [...prev, validatedData])
      
      toast.success(`Successfully uploaded ${validatedData.questions.length} questions and ${validatedData.sets.length} sets!`)
      
    } catch (error) {
      console.error('Upload error:', error)
      
      if (error instanceof ZodError) {
        const errors: ValidationError[] = error.issues.map(err => ({
          path: err.path.map(p => String(p)),
          message: err.message
        }))
        setValidationErrors(errors)
        toast.error("Validation failed - please check the errors below")
      } else if (error instanceof SyntaxError) {
        toast.error("Invalid JSON file - please check the file format")
      } else {
        toast.error(error instanceof Error ? error.message : "Upload failed")
      }
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone!")) {
      clearAllData()
      setAppData(null)
      setUploadedFiles([])
      toast.success("All data cleared")
    }
  }

  const downloadTemplate = () => {
    const template = {
      questions: [
        {
          id: "example_001",
          subject: "math",
          topic: "Addition within 10",
          skill: "Adding single digits",
          prompt: "What is 2 + 3?",
          type: "mcq_single",
          choices: [
            { id: "a", text: "4" },
            { id: "b", text: "5" },
            { id: "c", text: "6" },
            { id: "d", text: "7" }
          ],
          answer: "b",
          explanation: "2 + 3 = 5",
          hint: "Count on your fingers!",
          difficulty: "easy",
          tags: ["addition", "number bonds"],
          cambridgeRef: "Stage 1 Maths N1.2"
        }
      ],
      sets: [
        {
          id: "example_set_001",
          title: "Sample Math Set",
          subject: "math",
          description: "A sample set for testing",
          questionIds: ["example_001"],
          recommendedOrder: "fixed",
          timeLimitSeconds: 300
        }
      ]
    }
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'yaya-practice-template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

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
          <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
          <p className="text-xl text-muted-foreground">Manage your practice content</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="kid-heading flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Upload Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="kid-text text-muted-foreground">
            Upload a JSON file containing questions and practice sets. The file will be validated before import.
          </p>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="kid-button"
              />
            </div>
            <Button 
              onClick={downloadTemplate}
              variant="outline"
              className="kid-button"
            >
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>
          
          {isUploading && (
            <div className="space-y-2">
              <Progress value={undefined} className="w-full" />
              <p className="text-sm text-muted-foreground">Validating and importing...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Validation Errors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {validationErrors.map((error, index) => (
                <div key={index} className="text-sm">
                  <span className="font-mono text-red-600">{error.path.join('.')}: </span>
                  <span className="text-red-800">{error.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Data Overview */}
      {appData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="kid-heading">Current Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {appData.questions.length}
                </div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {appData.sets.length}
                </div>
                <div className="text-sm text-muted-foreground">Sets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {[...new Set(appData.questions.map(q => q.subject))].length}
                </div>
                <div className="text-sm text-muted-foreground">Subjects</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {['math', 'english', 'science'].map(subject => {
                const count = appData.questions.filter(q => q.subject === subject).length
                if (count === 0) return null
                return (
                  <Badge key={subject} variant="outline" className="text-kid-sm">
                    {subject}: {count} questions
                  </Badge>
                )
              })}
            </div>
            
            <Button 
              onClick={handleClearAllData}
              variant="destructive" 
              size="sm"
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload History */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="kid-heading">Upload History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Upload {index + 1}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.questions.length} questions, {data.sets.length} sets
                      </div>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Upload Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-800">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Files must be valid JSON format</li>
            <li>All question and set IDs must be unique</li>
            <li>Set questionIds must reference existing questions</li>
            <li>Supported question types: mcq_single, mcq_multi, short_answer, true_false, fill_blank, match, order</li>
            <li>Subjects must be: math, english, or science</li>
            <li>Download the template for the correct format</li>
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
