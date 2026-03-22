import Link from 'next/link'
import { Category, Forum } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Lock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ForumListProps {
  categories: Category[]
}

export function ForumList({ categories }: ForumListProps) {
  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.id} className="space-y-4">
          <h2 className="text-2xl font-bold">{category.title}</h2>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
          
          <div className="grid gap-4">
            {category.forums.map((forum) => (
              <ForumCard key={forum.id} forum={forum} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface ForumCardProps {
  forum: Forum
}

function ForumCard({ forum }: ForumCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link 
            href={`/forums/${forum.id}`}
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            {forum.title}
          </Link>
        </div>
        {forum.description && (
          <p className="text-sm text-muted-foreground">{forum.description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              {forum.topics_count} topics
            </span>
            <span>{forum.posts_count} posts</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
