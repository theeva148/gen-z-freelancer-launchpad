'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { Calendar, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import { ModuleHeader } from './module-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { ScheduledPost } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PLATFORMS = ['LinkedIn', 'Instagram', 'TikTok', 'X / Twitter', 'Threads']

function platformTone(p: string) {
  switch (p) {
    case 'LinkedIn':
      return 'text-chart-3'
    case 'Instagram':
      return 'text-accent'
    case 'TikTok':
      return 'text-foreground'
    case 'X / Twitter':
      return 'text-chart-3'
    default:
      return 'text-primary'
  }
}

export function SchedulerModule() {
  const { data, isLoading } = useSWR<{ posts: ScheduledPost[] }>(
    '/api/posts',
    fetcher,
  )
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [platform, setPlatform] = useState('LinkedIn')
  const [topic, setTopic] = useState('')
  const [content, setContent] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')

  const posts = data?.posts ?? []

  async function generate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, topic }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Request failed')
      setContent(json.content)
      if (json.suggestedTopic && !topic) setTopic(json.suggestedTopic)
      toast.success('Post drafted')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not generate a post. Try again.',
      )
    } finally {
      setGenerating(false)
    }
  }

  async function save() {
    if (!content.trim()) {
      toast.error('Write or generate some content first.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, topic, content, scheduledFor }),
      })
      if (!res.ok) throw new Error()
      setContent('')
      setTopic('')
      setScheduledFor('')
      await mutate('/api/posts')
      toast.success('Added to your schedule')
    } catch {
      toast.error('Could not save post.')
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number) {
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    await mutate('/api/posts')
    toast.success('Post removed')
  }

  return (
    <div className="space-y-8">
      <ModuleHeader
        title="Content Scheduler"
        description="Generate platform-native posts that market your skill, then queue them up. Consistency is the whole game."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-6">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select
              value={platform}
              onValueChange={(v) => setPlatform(v ?? 'LinkedIn')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic or angle (optional)</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. a lesson you learned on a recent project"
            />
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={generate}
            disabled={generating}
            className="w-full"
          >
            {generating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {generating ? 'Drafting…' : 'Generate with AI'}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="content">Post content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Your post will appear here. Edit it to sound like you."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="when">Schedule for</Label>
            <Input
              id="when"
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>

          <Button
            type="button"
            onClick={save}
            disabled={saving}
            className="w-full"
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add to schedule
          </Button>
        </Card>

        <div className="space-y-4">
          <h3 className="font-heading text-lg font-semibold">
            Your queue{' '}
            <span className="text-muted-foreground">({posts.length})</span>
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : posts.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 p-10 text-center">
              <Calendar className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-pretty">
                Nothing queued yet. Generate your first post to start showing up.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <Card key={post.id} className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={platformTone(post.platform)}
                    >
                      {post.platform}
                    </Badge>
                    <div className="flex items-center gap-3">
                      {post.scheduled_for && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {new Date(post.scheduled_for).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => remove(post.id)}
                        className="text-muted-foreground transition-colors hover:text-destructive"
                        aria-label="Delete post"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                  {post.topic && (
                    <p className="text-xs font-medium text-muted-foreground">
                      {post.topic}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {post.content}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
