"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Moon, Sun, Palette } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

export function AdminMenuClient() {
  const [showAdminMenu, setShowAdminMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
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
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('high-contrast')
    else setTheme('light')
  }

  if (!mounted) return null

  return (
    <>
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
          <Link href="/dashboard/">
            <Button variant="outline" size="icon" className="focus-ring" title="Settings & Dashboard">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/test/">
            <Button variant="outline" className="focus-ring" title="Test Data">
              Test Data
            </Button>
          </Link>
        </div>
      )}
    </>
  )
}
