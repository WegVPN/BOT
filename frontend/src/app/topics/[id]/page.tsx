'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { topicsApi, postsApi } from '@/lib/api'
import { Topic, Post } from '@/types'
import { Loader2, MessageSquare, Pin, Lock, Quote, Heart, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function TopicPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [totalPosts, setTotalPosts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const topicId = Number(params.id)

  useEffect(() => {
    async function loadTopic() {
      try {
        const response = await topicsApi.getById(topicId, 1, 50)
        setTopic(response.data.topic)
        setPosts(response.data.posts)
        setTotalPosts(response.data.total)
      } catch (error) {
        console.error('Failed to load topic:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTopic()
  }, [topicId])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || !isAuthenticated) return

    setSubmitting(true)
    try {
      const response = await postsApi.create(topicId, replyContent)
      setPosts([...posts, response.data])
      setReplyContent('')
      // Reload to get updated stats
      const topicResponse = await topicsApi.getById(topicId, 1, 50)
      setTopic(topicResponse.data.topic)
    } catch (error) {
      console.error('Failed to post reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = async (postId: number) => {
    try {
      await postsApi.like(postId)
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes_count: post.likes_count + 1, liked_by: [...(post.liked_by || []), user!.id] }
          : post
      ))
    } catch (error) {
      console.error('Failed to like post:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Topic not found</h1>
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
        {/* Topic Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/forums/${topic.forum.id}`} className="text-sm text-muted-foreground hover:text-primary">
              {topic.forum.title}
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-2xl font-bold">{topic.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {topic.is_pinned && (
              <Badge variant="warning" className="gap-1">
                <Pin className="h-3 w-3" /> Pinned
              </Badge>
            )}
            {topic.is_closed && (
              <Badge variant="destructive" className="gap-1">
                <Lock className="h-3 w-3" /> Closed
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1">
              <MessageSquare className="h-3 w-3" /> {topic.posts_count} posts
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3 w-3" /> {topic.views_count} views
            </Badge>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4 mb-8">
          {posts.map((post, index) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Author Info */}
                  <div className="flex-shrink-0 w-32 text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-2">
                      <AvatarImage src={post.user.avatar_url || ''} />
                      <AvatarFallback className="text-lg">
                        {post.user.nickname.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link 
                      href={`/users/${post.user.id}`}
                      className="font-semibold hover:text-primary block"
                    >
                      {post.user.nickname}
                    </Link>
                    {post.user.role && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {post.user.role.name}
                      </Badge>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      <div>Reputation: {post.user.reputation}</div>
                      <div>Posts: {post.user.posts_count}</div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                      <span>
                        {index === 0 ? 'Original Post' : `Reply #${index}`}
                        {' • '}
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        {post.edited_at && ' (edited)'}
                      </span>
                    </div>

                    <div className="prose dark:prose-invert max-w-none mb-4">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {post.content}
                      </ReactMarkdown>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4 border-t">
                      {isAuthenticated && post.user_id !== user?.id && !topic.is_closed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          disabled={post.liked_by?.includes(user.id)}
                          className="gap-1"
                        >
                          <Heart className={`h-4 w-4 ${post.liked_by?.includes(user.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          {post.likes_count}
                        </Button>
                      )}
                      {!topic.is_closed && isAuthenticated && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyContent(`> ${post.content.substring(0, 100)}...\n\n`)}
                          className="gap-1"
                        >
                          <Quote className="h-4 w-4" />
                          Quote
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reply Form */}
        {isAuthenticated && !topic.is_closed ? (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Post a Reply</h2>
              <form onSubmit={handleSubmitReply}>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="min-h-[150px] mb-4"
                  required
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting || !replyContent.trim()}>
                    {submitting ? 'Posting...' : 'Post Reply'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : topic.is_closed ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Lock className="h-8 w-8 mx-auto mb-2" />
              <p>This topic is closed. No new replies can be posted.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Please log in to post a reply</p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
