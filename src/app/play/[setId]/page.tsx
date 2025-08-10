import { getAvailableSetIds, getSetData } from "@/lib/static-data"
import { PlayClient } from "@/components/play-client"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{
    setId: string
  }>
}

// Generate static params for all available set IDs
export async function generateStaticParams() {
  const setIds = await getAvailableSetIds()
  return setIds.map((setId) => ({
    setId,
  }))
}

// Disable revalidation for static content
export const revalidate = false

export default async function PlayPage({ params }: PageProps) {
  const { setId } = await params
  
  // Get set data at build time
  const setData = await getSetData(setId)
  
  if (!setData) {
    notFound()
  }
  
  // Pass the static data to the client component
  return (
    <PlayClient 
      initialSet={setData.set}
      initialQuestions={setData.questions}
    />
  )
}
