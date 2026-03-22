'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { topicsApi } from '@/lib/api'
import { Topic } from '@/types'
import { Loader2, MessageSquare, Pin, Lock, TrendingUp, Plus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function ForumPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [topics, setTopics] = useState<Topic[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState('updated_at')

  const forumId = Number(params.id)

  useEffect(() => {
    async function loadTopics() {
      try {
        const response = await topicsApi.getByForum(forumId, 1, 50, sortBy)
        setTopics(response.data.topics)
        setTotal(response.data.total)
      } catch (error) {
        console.error('Failed to load topics:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTopics()
  }, [forumId, sortBy])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Forum Discussions</h1>
            <p className="text-muted-foreground">{total} topics</p>
          </div>
          {isAuthenticated && (
            <Link href={`/topics/new?forum=${forumId}`}>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Topic
              </Button>
            </Link>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={sortBy === 'updated_at' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('updated_at')}
          >
            Latest
          </Button>
          <Button
            variant={sortBy === 'posts_count' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('posts_count')}
          >
            Most Active
          </Button>
          <Button
            variant={sortBy === 'views_count' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('views_count')}
          >
            Most Viewed
          </Button>
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {topics.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-4">No topics yet</p>
                {isAuthenticated && (
                  <Link href={`/topics/new?forum=${forumId}`}>
                    <Button>Create the first topic</Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/topics/${topic.id}`}
                      className="text-lg font-semibold hover:text-primary transition-colors flex-1"
                    >
                      <div className="flex items-center gap-2">
                        {topic.is_pinned && (
                          <Pin className="h-4 w-4 text-yellow-500" />
                        )}
                        {topic.is_closed && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        {topic.title}
                      </div>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Link
                        href={`/users/${topic.user.id}`}
                        className="flex items-center gap-2 hover:text-primary"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={topic.user.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {topic.user.nickname.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{topic.user.nickname}</span>
                      </Link>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(topic.created_at), { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {topic.posts_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {topic.views_count}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
