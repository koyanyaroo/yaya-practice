import { SubjectCard } from "@/components/ui/subject-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStaticAppData } from "@/lib/static-data"
import { AdminMenuClient } from "@/components/admin-menu-client"
import { PERSONALIZATION, getUserName } from "@/lib/personalization"

// This page is now a Server Component that loads data at build time
export default async function Home() {
  // Load static data at build time
  const appData = await getStaticAppData()

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
        <h1 className="text-4xl font-bold text-primary mb-2">{getUserName()}&apos;s Learning Space</h1>
        <p className="text-xl text-muted-foreground">Made especially for {PERSONALIZATION.user.fullName}!</p>
      </div>
        
        {/* Admin menu - client component for interactivity */}
        <AdminMenuClient />
      </div>

      {/* Personalized Welcome Message */}
      <Card className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="kid-heading text-center">{PERSONALIZATION.messages.welcome.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="kid-text mb-4">
            {PERSONALIZATION.messages.welcome.subtitle}
          </p>
          <p className="kid-text text-primary font-semibold">
            {PERSONALIZATION.messages.welcome.encouragement}
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>✨ This learning space is made just for you, {getUserName()}! ✨</p>
            <p>From {PERSONALIZATION.user.parentName} with love 💖</p>
          </div>
        </CardContent>
      </Card>

      {/* Subject Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <SubjectCard
          subject="math"
          title="Math Magic"
          description={PERSONALIZATION.messages.subjectIntros.math}
          topicCount={subjectStats.math.topics}
          completedCount={0} // TODO: Calculate from progress
        />
        
        <SubjectCard
          subject="english"
          title="English Adventures"
          description={PERSONALIZATION.messages.subjectIntros.english}
          topicCount={subjectStats.english.topics}
          completedCount={0} // TODO: Calculate from progress
        />
        
        <SubjectCard
          subject="science"
          title="Science Discovery"
          description={PERSONALIZATION.messages.subjectIntros.science}
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
      <div className="mt-12 text-center">
        <p className="text-xs text-muted-foreground opacity-30 hover:opacity-100 transition-opacity duration-300">
          For administrators: Press Ctrl+Shift+A to access settings
        </p>
      </div>
    </main>
  )
}
