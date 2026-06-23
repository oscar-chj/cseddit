"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  createPost,
  deleteDraft,
  getCurrentUser,
  getCurrentUserId,
  getDrafts,
  saveDraft,
} from "@/lib/mockDb"
import { Draft, User } from "@/types"
import {
  CheckIcon,
  CodeIcon,
  FloppyDiskIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  PaperPlaneTiltIcon,
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TrashIcon,
} from "@phosphor-icons/react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

const AVAILABLE_TAGS = [
  "React",
  "SQL",
  "Python",
  "Architecture",
  "Security",
  "Performance",
  "Next.js",
  "Tailwind",
  "Rust",
  "Systems",
]

export default function AskQuestionPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [mediaUrl, setMediaUrl] = useState("")
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [postDepartment, setPostDepartment] = useState("None/General")
  const [postYear, setPostYear] = useState("None/General")

  const isTitleEmpty = title.trim() === ""

  const isContentEmpty =
    activeTab === "text"
      ? content.trim() === ""
      : activeTab === "image"
        ? mediaUrl.trim() === ""
        : activeTab === "link"
          ? mediaUrl.trim() === ""
          : activeTab === "poll"
            ? pollOptions.filter((opt) => opt.trim() !== "").length < 2
            : false

  const hasNoContentToSave =
    title.trim() === "" &&
    content.trim() === "" &&
    mediaUrl.trim() === "" &&
    pollOptions.every((opt) => opt.trim() === "")

  const contentRequirementText =
    activeTab === "text"
      ? "Provide question details (body)"
      : activeTab === "image"
        ? "Provide an image/video URL"
        : activeTab === "link"
          ? "Provide an external link URL"
          : "Provide at least 2 poll options"

  useEffect(() => {
    const draftsList = getDrafts()
    const user = getCurrentUser()
    setTimeout(() => {
      setMounted(true)
      setDrafts(draftsList)
      setCurrentUser(user)
      if (user) {
        setIsAnonymous(user.anonymousByDefault)
        setPostDepartment(user.department || "None/General")
        setPostYear(user.yearOfStudy || "None/General")
      }
    }, 0)
  }, [])

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag])
      } else {
        toast.warning("You can select up to 5 tags")
      }
    }
  }

  const insertMarkdown = (before: string, after: string) => {
    const textarea = document.getElementById(
      "question-body"
    ) as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selected = text.substring(start, end)
    const replacement = before + selected + after
    setContent(text.substring(0, start) + replacement + text.substring(end))
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      )
    }, 0)
  }

  const handlePost = () => {
    if (!title.trim()) {
      toast.error("Enter a title")
      return
    }

    if (activeTab === "text") {
      if (!content.trim()) {
        toast.error("Describe your question details")
        return
      }
    } else if (activeTab === "image") {
      if (!mediaUrl.trim()) {
        toast.error("Enter an image/video URL")
        return
      }
    } else if (activeTab === "link") {
      if (!mediaUrl.trim()) {
        toast.error("Enter an external link URL")
        return
      }
    } else if (activeTab === "poll") {
      const validOptions = pollOptions.filter((opt) => opt.trim() !== "")
      if (validOptions.length < 2) {
        toast.error("Provide at least 2 non-empty poll options")
        return
      }
    }

    setIsPosting(true)
    setTimeout(() => {
      const currentUserId = getCurrentUserId()
      const newPost = createPost({
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        authorId: isAnonymous ? "anonymous" : currentUserId,
        isFeatured: false,
        postType: activeTab as "text" | "image" | "link" | "poll",
        mediaUrl:
          activeTab === "image" || activeTab === "link"
            ? mediaUrl.trim()
            : undefined,
        pollOptions:
          activeTab === "poll"
            ? pollOptions
                .filter((opt) => opt.trim() !== "")
                .map((opt) => ({ text: opt.trim(), votes: [] }))
            : undefined,
        department: postDepartment === "None/General" ? undefined : postDepartment,
        yearOfStudy: postYear === "None/General" ? undefined : postYear,
      })

      if (activeDraftId) {
        deleteDraft(activeDraftId)
      }

      setIsPosting(false)
      toast.success("Post published successfully")
      router.push(`/posts/${newPost.id}`)
    }, 500)
  }

  const handleSaveDraft = () => {
    const hasAnyContent =
      title.trim() ||
      content.trim() ||
      mediaUrl.trim() ||
      pollOptions.some((opt) => opt.trim() !== "")

    if (!hasAnyContent) {
      toast.error("Cannot save an empty draft")
      return
    }

    const draft = saveDraft({
      id: activeDraftId || undefined,
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      isAnonymous,
      postType: activeTab as "text" | "image" | "link" | "poll",
      mediaUrl:
        activeTab === "image" || activeTab === "link"
          ? mediaUrl.trim()
          : undefined,
      pollOptions:
        activeTab === "poll"
          ? pollOptions.map((opt) => ({ text: opt.trim(), votes: [] }))
          : undefined,
      department: postDepartment === "None/General" ? undefined : postDepartment,
      yearOfStudy: postYear === "None/General" ? undefined : postYear,
    })

    setActiveDraftId(draft.id)
    setDrafts(getDrafts())
    toast("Draft saved")
  }

  const handleLoadDraft = (draft: Draft) => {
    setTitle(draft.title)
    setContent(draft.content)
    setSelectedTags(draft.tags)
    setIsAnonymous(draft.isAnonymous)
    setActiveDraftId(draft.id)
    setActiveTab(draft.postType || "text")
    setMediaUrl(draft.mediaUrl || "")
    if (draft.pollOptions && draft.pollOptions.length > 0) {
      setPollOptions(draft.pollOptions.map((opt) => opt.text))
    } else {
      setPollOptions(["", ""])
    }
    setPostDepartment(draft.department || "None/General")
    setPostYear(draft.yearOfStudy || "None/General")
    toast("Draft loaded")
  }

  const handleDeleteDraft = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    deleteDraft(id)
    if (activeDraftId === id) {
      setActiveDraftId(null)
      setTitle("")
      setContent("")
      setSelectedTags([])
      setIsAnonymous(false)
      setActiveTab("text")
      setMediaUrl("")
      setPollOptions(["", ""])
      setPostDepartment(currentUser?.department || "None/General")
      setPostYear(currentUser?.yearOfStudy || "None/General")
    }
    setDrafts(getDrafts())
    toast("Draft deleted")
  }

  if (!mounted) return null

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Create a post</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Share your thoughts, ask questions, post updates, or start surveys
            with the community.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Main Creation Form */}
        <div className="space-y-6 lg:col-span-3">
          {/* Anonymity Selector */}
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Card A: Publish as User */}
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`flex cursor-pointer items-start gap-3 rounded-none border p-3 text-left transition-all ${
                  !isAnonymous
                    ? "border-blue-600 bg-blue-50/5 ring-1 ring-blue-600 dark:bg-blue-950/20"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <Avatar className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none">
                  {currentUser?.avatar || "👾"}
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    Publish publicly
                  </p>
                  <p className="text-xs leading-snug text-muted-foreground">
                    Your profile details will be shown.
                  </p>
                </div>
              </button>

              {/* Card B: Publish Anonymously */}
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`flex cursor-pointer items-start gap-3 rounded-none border p-3 text-left transition-all ${
                  isAnonymous
                    ? "border-blue-600 bg-blue-50/5 ring-1 ring-blue-600 dark:bg-blue-950/20"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <Avatar className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none">
                  👤
                </Avatar>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    Publish anonymously
                  </p>
                  <p className="text-xs leading-snug text-muted-foreground">
                    Your profile details will be hidden.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Post tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid h-10 w-full grid-cols-4 rounded-none border border-border bg-muted p-1">
              <TabsTrigger
                value="text"
                className="rounded-none border-0 text-xs data-[state=active]:bg-background"
              >
                Text
              </TabsTrigger>
              <TabsTrigger
                value="image"
                className="rounded-none border-0 text-xs data-[state=active]:bg-background"
              >
                Image/video
              </TabsTrigger>
              <TabsTrigger
                value="link"
                className="rounded-none border-0 text-xs data-[state=active]:bg-background"
              >
                Link
              </TabsTrigger>
              <TabsTrigger
                value="poll"
                className="rounded-none border-0 text-xs data-[state=active]:bg-background"
              >
                Poll
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label
                htmlFor="post-title"
                className="text-sm font-bold text-foreground"
              >
                Title
              </Label>
              <Input
                id="post-title"
                placeholder={
                  activeTab === "text"
                    ? "e.g. How do I center a div using Tailwind CSS grid?"
                    : activeTab === "image"
                      ? "e.g. My new portfolio layout or system design"
                      : activeTab === "link"
                        ? "e.g. Helpful guide on Rust memory management"
                        : "e.g. What is your primary programming language?"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 rounded-none text-sm focus-visible:ring-blue-500 border-border"
              />
            </div>

            {/* Dynamic rendering of other inputs */}
            {activeTab === "text" && (
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground">
                  Question body
                </Label>
                <div
                  className="overflow-hidden rounded-none border focus-within:ring-2 focus-within:ring-blue-500 border-border"
                >
                  {/* Editor Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 p-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => insertMarkdown("**", "**")}
                      title="Bold"
                    >
                      <TextBIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => insertMarkdown("*", "*")}
                      title="Italic"
                    >
                      <TextItalicIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => insertMarkdown("<u>", "</u>")}
                      title="Underline"
                    >
                      <TextUnderlineIcon className="h-4 w-4" />
                    </Button>
                    <span className="mx-1 h-5 w-px bg-border" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => insertMarkdown("- ", "")}
                      title="Bullet list"
                    >
                      <ListBulletsIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => insertMarkdown("1. ", "")}
                      title="Numbered list"
                    >
                      <ListNumbersIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => insertMarkdown("`", "`")}
                      title="Inline code"
                    >
                      <CodeIcon className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Textarea */}
                  <Textarea
                    id="question-body"
                    placeholder="Introduce the problem and expand on what you've tried..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[220px] resize-y rounded-none border-0 p-4 text-sm focus-visible:ring-0"
                  />
                </div>
              </div>
            )}

            {activeTab === "image" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="image-url"
                    className="text-sm font-bold text-foreground"
                  >
                    Image/video URL
                  </Label>
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="h-10 rounded-none text-sm focus-visible:ring-blue-500 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="image-description"
                    className="text-sm font-bold text-foreground"
                  >
                    Description / caption
                  </Label>
                  <Textarea
                    id="image-description"
                    placeholder="Add a description or caption for your image/video..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] resize-y rounded-none border-border p-4 text-sm focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "link" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="link-url"
                    className="text-sm font-bold text-foreground"
                  >
                    External link URL
                  </Label>
                  <Input
                    id="link-url"
                    placeholder="https://github.com"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="h-10 rounded-none text-sm focus-visible:ring-blue-500 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="link-description"
                    className="text-sm font-bold text-foreground"
                  >
                    Description / commentary
                  </Label>
                  <Textarea
                    id="link-description"
                    placeholder="Add some description or commentary about this link..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] resize-y rounded-none border-border p-4 text-sm focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {activeTab === "poll" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Poll options editor
                  </Label>
                  <div
                    className="space-y-2 rounded-none border bg-muted/10 p-3 border-border"
                  >
                    {pollOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">
                          Option {idx + 1}
                        </span>
                        <Input
                          placeholder={`Option ${idx + 1} text`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...pollOptions]
                            newOptions[idx] = e.target.value
                            setPollOptions(newOptions)
                          }}
                          className="h-10 flex-1 rounded-none border-border text-sm focus-visible:ring-blue-500"
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = pollOptions.filter(
                                (_, i) => i !== idx
                              )
                              setPollOptions(newOptions)
                            }}
                            className="h-9 shrink-0 rounded-none border-border px-3 text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
                          >
                            <TrashIcon className="mr-1 h-3.5 w-3.5" />
                            Remove option
                          </Button>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 pt-1">
                      {pollOptions.length < 6 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (pollOptions.length < 6) {
                              setPollOptions([...pollOptions, ""])
                            }
                          }}
                          className="rounded-none border-border text-xs transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          Add option
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="poll-description"
                    className="text-sm font-bold text-foreground"
                  >
                    Description / context
                  </Label>
                  <Textarea
                    id="poll-description"
                    placeholder="Add some context or details for this poll..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] resize-y rounded-none border-border p-4 text-sm focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Custom Department and Year tag selectors */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="post-department" className="text-sm font-bold text-foreground">
                  Post Department Tag
                </Label>
                <NativeSelect
                  id="post-department"
                  value={postDepartment}
                  onChange={(e) => setPostDepartment(e.target.value)}
                  className="w-full"
                >
                  <NativeSelectOption value="None/General">None/General</NativeSelectOption>
                  <NativeSelectOption value="Computer Science">Computer Science</NativeSelectOption>
                  <NativeSelectOption value="Software Engineering">Software Engineering</NativeSelectOption>
                  <NativeSelectOption value="Networking">Networking</NativeSelectOption>
                  <NativeSelectOption value="Multimedia">Multimedia</NativeSelectOption>
                </NativeSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="post-year" className="text-sm font-bold text-foreground">
                  Post Year Tag
                </Label>
                <NativeSelect
                  id="post-year"
                  value={postYear}
                  onChange={(e) => setPostYear(e.target.value)}
                  className="w-full"
                >
                  <NativeSelectOption value="None/General">None/General</NativeSelectOption>
                  <NativeSelectOption value="1st Year">1st Year</NativeSelectOption>
                  <NativeSelectOption value="2nd Year">2nd Year</NativeSelectOption>
                  <NativeSelectOption value="3rd Year">3rd Year</NativeSelectOption>
                  <NativeSelectOption value="4th Year">4th Year</NativeSelectOption>
                </NativeSelect>
              </div>
            </div>

            {/* Tags Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">
                Tags (max 5)
              </Label>
              <div className="flex flex-wrap gap-2 rounded-none border border-border bg-muted/20 p-3">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <Badge
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleTagToggle(tag)}
                      className={`cursor-pointer rounded-none px-2.5 py-1 text-xs font-normal transition-colors ${
                        isSelected
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border-border text-muted-foreground hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      {tag}
                    </Badge>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handlePost}
                disabled={isTitleEmpty || isContentEmpty || isPosting}
                className="h-10 gap-1.5 rounded-none bg-blue-600 px-5 text-white hover:bg-blue-700"
              >
                {isPosting ? (
                  <Spinner className="h-4 w-4" />
                ) : (
                  <PaperPlaneTiltIcon className="h-4 w-4" weight="bold" />
                )}
                Post
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={hasNoContentToSave}
                className="h-10 gap-1.5 rounded-none border-border transition-colors hover:bg-blue-50 hover:text-blue-600"
              >
                <FloppyDiskIcon className="h-4 w-4" />
                Save draft
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar drafts */}
        <div className="space-y-4 lg:col-span-1">
          {/* Post Requirements Guide */}
          <div className="space-y-3 rounded-none border border-border bg-card p-4">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Post Requirements Guide
            </h3>
            <div className="space-y-3">
              {/* Requirement 1: Title */}
              <div className="flex items-center gap-2.5">
                {!isTitleEmpty ? (
                  <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-none bg-green-500/10 text-green-600 dark:text-green-400 border border-green-600/20">
                    <CheckIcon className="h-3 w-3" weight="bold" />
                  </div>
                ) : (
                  <div className="h-4.5 w-4.5 shrink-0 border border-muted-foreground/30 rounded-none" />
                )}
                <span
                  className={`text-xs font-medium transition-colors ${
                    !isTitleEmpty ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                  }`}
                >
                  Provide a descriptive title
                </span>
              </div>

              {/* Requirement 2: Content */}
              <div className="flex items-center gap-2.5">
                {!isContentEmpty ? (
                  <div className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-none bg-green-500/10 text-green-600 dark:text-green-400 border border-green-600/20">
                    <CheckIcon className="h-3 w-3" weight="bold" />
                  </div>
                ) : (
                  <div className="h-4.5 w-4.5 shrink-0 border border-muted-foreground/30 rounded-none" />
                )}
                <span
                  className={`text-xs font-medium transition-colors ${
                    !isContentEmpty ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                  }`}
                >
                  {contentRequirementText}
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Your saved drafts
          </h2>
          <div className="space-y-3">
            {drafts.length === 0 ? (
              <p className="rounded-none border border-dashed border-border bg-muted/20 p-3 text-xs text-muted-foreground">
                No active drafts.
              </p>
            ) : (
              drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => handleLoadDraft(draft)}
                  className={`cursor-pointer rounded-none border p-3 text-left transition-all hover:bg-muted/40 ${
                    activeDraftId === draft.id
                      ? "border-blue-500 bg-blue-50/10"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="line-clamp-1 text-xs font-bold text-foreground">
                      {draft.title || "(Untitled draft)"}
                    </span>
                    <button
                      onClick={(e) => handleDeleteDraft(e, draft.id)}
                      className="p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
                    {draft.content ||
                      (draft.postType === "image" || draft.postType === "link"
                        ? draft.mediaUrl
                        : draft.postType === "poll"
                          ? `Poll: ${
                              draft.pollOptions
                                ?.map((o) => o.text)
                                .filter(Boolean)
                                .join(", ") || "No options"
                            }`
                          : "Empty content")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
