'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { Header } from '@/components/layout/header'
import { ForumList } from '@/components/forum/forum-list'
import { ActiveTopics } from '@/components/forum/active-topics'
import { categoriesApi, topicsApi } from '@/lib/api'
import { Category } from '@/types'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { isAuthenticated, fetchUser } = useAuthStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTopics, setActiveTopics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    async function loadData() {
      try {
        const [categoriesRes, topicsRes] = await Promise.all([
          categoriesApi.getAll(),
          topicsApi.getActive(5),
        ])
        setCategories(categoriesRes.data)
        setActiveTopics(topicsRes.data)
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

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
        {/* Hero Section */}
        <section className="mb-8 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 p-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to the Forum</h1>
          <p className="text-muted-foreground mb-4">
            Join discussions, share knowledge, and connect with the community
          </p>
          {isAuthenticated && (
            <Link href="/topics/new">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
                Create New Topic
              </button>
            </Link>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Categories and Forums */}
          <div className="lg:col-span-3">
            <ForumList categories={categories} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ActiveTopics topics={activeTopics} />
          </div>
        </div>
      </main>

      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Forum. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
