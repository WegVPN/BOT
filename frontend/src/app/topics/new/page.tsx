'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { topicsApi, forumsApi } from '@/lib/api'
import { Forum } from '@/types'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function NewTopicPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [forumId, setForumId] = useState<number | ''>('')
  const [forums, setForums] = useState<Forum[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    async function loadForums() {
      try {
        const response = await forumsApi.getAll()
        setForums(response.data)
        
        // Pre-select forum from URL param
        const forumParam = searchParams.get('forum')
        if (forumParam) {
          setForumId(Number(forumParam))
        }
      } catch (error) {
        console.error('Failed to load forums:', error)
      }
    }
    loadForums()
  }, [isAuthenticated, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forumId || !title.trim() || !content.trim()) return

    setSubmitting(true)
    try {
      const response = await topicsApi.create(title, Number(forumId), content)
      router.push(`/topics/${response.data.id}`)
    } catch (error) {
      console.error('Failed to create topic:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Create New Topic</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="forum">Forum</Label>
                  <select
                    id="forum"
                    value={forumId}
                    onChange={(e) => setForumId(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    required
                  >
                    <option value="">Select a forum</option>
                    {forums.map((forum) => (
                      <option key={forum.id} value={forum.id}>
                        {forum.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter topic title"
                    required
                    minLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your topic content..."
                    className="min-h-[200px]"
                    required
                    minLength={10}
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <Link href="/">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={submitting || !forumId || !title.trim() || !content.trim()}>
                    {submitting ? 'Creating...' : 'Create Topic'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
