import { AppData } from '@/types'
import { getAppData, saveAppData } from './persistence'

export async function initializeAppData(): Promise<boolean> {
  // Check if data already exists
  const existingData = getAppData()
  if (existingData && existingData.questions.length > 0) {
    console.log('App data already initialized')
    return true
  }

  try {
    console.log('Loading question data from server...')
    
    // Call our server-side API endpoint that reads from filesystem
    const response = await fetch('/api/questions')
    
    if (!response.ok) {
      console.error('Failed to load question data:', response.statusText)
      return false
    }

    const appData: AppData = await response.json()
    
    if (!appData.questions || appData.questions.length === 0) {
      console.error('No questions found in loaded data')
      return false
    }

    // Save the loaded data
    saveAppData(appData)
    
    console.log(`Successfully initialized app with ${appData.questions.length} questions and ${appData.sets.length} sets`)
    return true
    
  } catch (error) {
    console.error('Error initializing app data:', error)
    return false
  }
}

// Function to reset and reload data (for testing)
export async function resetAndReloadData(): Promise<boolean> {
  console.log('Resetting and reloading app data...')
  
  // Clear existing data
  if (typeof window !== 'undefined') {
    localStorage.removeItem('yaya-practice-app-data')
  }
  
  // Force reload
  return await initializeAppData()
}
