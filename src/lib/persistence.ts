import { ChildProfile, SetProgress, QuestionAttempt, AppData } from '@/types'

const STORAGE_KEYS = {
  PROFILES: 'yaya-practice-profiles',
  CURRENT_PROFILE: 'yaya-practice-current-profile',
  APP_DATA: 'yaya-practice-app-data',
  UPLOADED_DATA: 'yaya-practice-uploaded-data',
} as const

// Profile management
export function getProfiles(): ChildProfile[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILES)
    if (!stored) return []
    
    const profiles = JSON.parse(stored)
    // Convert date strings back to Date objects
    return profiles.map((profile: any) => ({
      ...profile,
      createdAt: new Date(profile.createdAt),
      progress: profile.progress.map((progress: any) => ({
        ...progress,
        completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined,
        attempts: progress.attempts.map((attempt: any) => ({
          ...attempt,
          timestamp: new Date(attempt.timestamp)
        }))
      }))
    }))
  } catch (error) {
    console.error('Error loading profiles:', error)
    return []
  }
}

export function saveProfiles(profiles: ChildProfile[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles))
  } catch (error) {
    console.error('Error saving profiles:', error)
  }
}

export function getCurrentProfile(): ChildProfile | null {
  if (typeof window === 'undefined') return null
  
  try {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE)
    if (!currentId) return null
    
    const profiles = getProfiles()
    return profiles.find(p => p.id === currentId) || null
  } catch (error) {
    console.error('Error getting current profile:', error)
    return null
  }
}

export function setCurrentProfile(profileId: string): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEYS.CURRENT_PROFILE, profileId)
}

export function createProfile(name: string, avatar?: string): ChildProfile {
  const profile: ChildProfile = {
    id: generateProfileId(),
    name,
    avatar,
    createdAt: new Date(),
    progress: [],
    preferences: {
      theme: 'light',
      dyslexiaFriendly: false,
      audioEnabled: true
    }
  }
  
  const profiles = getProfiles()
  profiles.push(profile)
  saveProfiles(profiles)
  setCurrentProfile(profile.id)
  
  return profile
}

export function updateProfile(profileId: string, updates: Partial<ChildProfile>): void {
  const profiles = getProfiles()
  const index = profiles.findIndex(p => p.id === profileId)
  
  if (index === -1) return
  
  profiles[index] = { ...profiles[index], ...updates }
  saveProfiles(profiles)
}

export function deleteProfile(profileId: string): void {
  const profiles = getProfiles()
  const filtered = profiles.filter(p => p.id !== profileId)
  saveProfiles(filtered)
  
  const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_PROFILE)
  if (currentId === profileId) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PROFILE)
  }
}

// Progress management
export function saveSetProgress(profileId: string, setProgress: SetProgress): void {
  const profiles = getProfiles()
  const profile = profiles.find(p => p.id === profileId)
  
  if (!profile) return
  
  const existingIndex = profile.progress.findIndex(p => p.setId === setProgress.setId)
  
  if (existingIndex === -1) {
    profile.progress.push(setProgress)
  } else {
    profile.progress[existingIndex] = setProgress
  }
  
  saveProfiles(profiles)
}

export function getSetProgress(profileId: string, setId: string): SetProgress | null {
  const profile = getProfiles().find(p => p.id === profileId)
  return profile?.progress.find(p => p.setId === setId) || null
}

export function addQuestionAttempt(profileId: string, setId: string, attempt: QuestionAttempt): void {
  const profiles = getProfiles()
  const profile = profiles.find(p => p.id === profileId)
  
  if (!profile) return
  
  let setProgress = profile.progress.find(p => p.setId === setId)
  
  if (!setProgress) {
    setProgress = {
      setId,
      attempts: [],
      score: 0,
      totalQuestions: 0,
      timeSpent: 0
    }
    profile.progress.push(setProgress)
  }
  
  setProgress.attempts.push(attempt)
  setProgress.score = setProgress.attempts.filter(a => a.isCorrect).length
  setProgress.timeSpent += attempt.timeSpent
  
  saveProfiles(profiles)
}

// App data management
export function getAppData(): AppData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_DATA)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error('Error loading app data:', error)
    return null
  }
}

export function saveAppData(data: AppData): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving app data:', error)
  }
}

export function getUploadedData(): AppData[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.UPLOADED_DATA)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading uploaded data:', error)
    return []
  }
}

export function saveUploadedData(dataArray: AppData[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEYS.UPLOADED_DATA, JSON.stringify(dataArray))
  } catch (error) {
    console.error('Error saving uploaded data:', error)
  }
}

export function addUploadedData(data: AppData): void {
  const existing = getUploadedData()
  existing.push(data)
  saveUploadedData(existing)
}

// Export/Import utilities
export function exportProfile(profileId: string): string {
  const profile = getProfiles().find(p => p.id === profileId)
  if (!profile) throw new Error('Profile not found')
  
  return JSON.stringify(profile, null, 2)
}

export function importProfile(jsonString: string): ChildProfile {
  try {
    const profileData = JSON.parse(jsonString)
    
    // Validate and convert dates
    const profile: ChildProfile = {
      ...profileData,
      id: generateProfileId(), // Generate new ID to avoid conflicts
      createdAt: new Date(profileData.createdAt),
      progress: profileData.progress.map((progress: any) => ({
        ...progress,
        completedAt: progress.completedAt ? new Date(progress.completedAt) : undefined,
        attempts: progress.attempts.map((attempt: any) => ({
          ...attempt,
          timestamp: new Date(attempt.timestamp)
        }))
      }))
    }
    
    const profiles = getProfiles()
    profiles.push(profile)
    saveProfiles(profiles)
    
    return profile
  } catch (error) {
    throw new Error('Invalid profile data')
  }
}

// Clear all data (for testing/reset)
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key)
  })
}

// Helper functions
function generateProfileId(): string {
  return `profile_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}
