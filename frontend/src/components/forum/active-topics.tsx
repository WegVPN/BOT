import Link from 'next/link'
import { Topic } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, TrendingUp } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'

interface ActiveTopicsProps {
  topics: Topic[]
}

export function ActiveTopics({ topics }: ActiveTopicsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <TrendingUp className="h-5 w-5 mr-2" />
          Active Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active topics</p>
          ) : (
            topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/topics/${topic.id}`}
                className="block group"
              >
                <div className="flex items-start space-x-3 pb-3 border-b last:border-0 last:pb-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={topic.user.avatar_url || ''} />
                    <AvatarFallback>
                      {topic.user.nickname.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {topic.title}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <span className="truncate">{topic.user.nickname}</span>
                      <span className="mx-1">•</span>
                      <span>{formatDistanceToNow(new Date(topic.updated_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {topic.posts_count}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
