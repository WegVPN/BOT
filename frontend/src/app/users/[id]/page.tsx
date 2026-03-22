'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { usersApi, postsApi } from '@/lib/api'
import { User, Post } from '@/types'
import { Loader2, Calendar, MessageSquare, Award, TrendingUp, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function UserProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [recentPosts, setRecentPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const userId = Number(params.id)

  useEffect(() => {
    async function loadUser() {
      try {
        const [userRes, postsRes] = await Promise.all([
          usersApi.getById(userId),
          postsApi.getByUser(userId, 1, 5),
        ])
        setUser(userRes.data)
        setRecentPosts(postsRes.data.posts)
      } catch (error) {
        console.error('Failed to load user:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <Link href="/">
            <Button className="mt-4">Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="text-4xl">
                    {user.nickname.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{user.nickname}</CardTitle>
                {user.role && (
                  <Badge variant="secondary" className="mt-2">
                    {user.role.name}
                  </Badge>
                )}
                {user.status === 'banned' && (
                  <Badge variant="destructive" className="mt-2">
                    Banned
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {user.signature && (
                  <div className="text-sm text-muted-foreground italic border-t pt-4">
                    {user.signature}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.topics_count}</div>
                    <div className="text-xs text-muted-foreground">Topics</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.posts_count}</div>
                    <div className="text-xs text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{user.reputation}</div>
                    <div className="text-xs text-muted-foreground">Reputation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatDistanceToNow(new Date(user.created_at), { addSuffix: false }).split(' ')[0]}
                    </div>
                    <div className="text-xs text-muted-foreground">Days Member</div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                  </div>
                  {user.last_seen && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Last seen {formatDistanceToNow(new Date(user.last_seen), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentPosts.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No posts yet</p>
                ) : (
                  <div className="space-y-4">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2 text-sm text-muted-foreground">
                          <Link
                            href={`/topics/${post.topic.id}`}
                            className="text-primary hover:underline"
                          >
                            {post.topic.title}
                          </Link>
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                        </div>
                        <div className="prose dark:prose-invert max-w-none text-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {post.content.substring(0, 300)}
                            {post.content.length > 300 ? '...' : ''}
                          </ReactMarkdown>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {post.likes_count} likes
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
