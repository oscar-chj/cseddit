"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId, getCurrentUser, createPost, saveDraft, getDrafts, deleteDraft } from "@/lib/mockDb";
import { Draft, User } from "@/types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TextBIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  CodeIcon,
  FloppyDiskIcon,
  PaperPlaneTiltIcon,
  TrashIcon
} from "@phosphor-icons/react";

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
  "Systems"
];

export default function AskQuestionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const draftsList = getDrafts();
    const user = getCurrentUser();
    setTimeout(() => {
      setMounted(true);
      setDrafts(draftsList);
      setCurrentUser(user);
      if (user) {
        setIsAnonymous(user.anonymousByDefault);
      }
    }, 0);
  }, []);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 5) {
        setSelectedTags([...selectedTags, tag]);
      } else {
        toast.warning("You can select up to 5 tags");
      }
    }
  };

  const insertMarkdown = (before: string, after: string) => {
    const textarea = document.getElementById("question-body") as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = before + selected + after;
    setContent(text.substring(0, start) + replacement + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    }, 0);
  };

  const handlePost = () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (activeTab === "text") {
      if (!content.trim()) {
        toast.error("Please describe your question details");
        return;
      }
    } else if (activeTab === "image") {
      if (!mediaUrl.trim()) {
        toast.error("Please enter an image/video URL");
        return;
      }
    } else if (activeTab === "link") {
      if (!mediaUrl.trim()) {
        toast.error("Please enter an external link URL");
        return;
      }
    } else if (activeTab === "poll") {
      const validOptions = pollOptions.filter((opt) => opt.trim() !== "");
      if (validOptions.length < 2) {
        toast.error("Please provide at least 2 non-empty poll options");
        return;
      }
    }

    const currentUserId = getCurrentUserId();
    const newPost = createPost({
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      authorId: isAnonymous ? "anonymous" : currentUserId,
      isFeatured: false,
      postType: activeTab as "text" | "image" | "link" | "poll",
      mediaUrl: (activeTab === "image" || activeTab === "link") ? mediaUrl.trim() : undefined,
      pollOptions: activeTab === "poll"
        ? pollOptions.filter((opt) => opt.trim() !== "").map((opt) => ({ text: opt.trim(), votes: [] }))
        : undefined,
    });

    if (activeDraftId) {
      deleteDraft(activeDraftId);
    }

    toast("Post published");
    router.push(`/posts/${newPost.id}`);
  };

  const handleSaveDraft = () => {
    const hasAnyContent =
      title.trim() ||
      content.trim() ||
      mediaUrl.trim() ||
      pollOptions.some((opt) => opt.trim() !== "");

    if (!hasAnyContent) {
      toast.error("Cannot save an empty draft");
      return;
    }

    const draft = saveDraft({
      id: activeDraftId || undefined,
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      isAnonymous,
      postType: activeTab as "text" | "image" | "link" | "poll",
      mediaUrl: (activeTab === "image" || activeTab === "link") ? mediaUrl.trim() : undefined,
      pollOptions: activeTab === "poll"
        ? pollOptions.map((opt) => ({ text: opt.trim(), votes: [] }))
        : undefined,
    });

    setActiveDraftId(draft.id);
    setDrafts(getDrafts());
    toast("Draft saved");
  };

  const handleLoadDraft = (draft: Draft) => {
    setTitle(draft.title);
    setContent(draft.content);
    setSelectedTags(draft.tags);
    setIsAnonymous(draft.isAnonymous);
    setActiveDraftId(draft.id);
    setActiveTab(draft.postType || "text");
    setMediaUrl(draft.mediaUrl || "");
    if (draft.pollOptions && draft.pollOptions.length > 0) {
      setPollOptions(draft.pollOptions.map((opt) => opt.text));
    } else {
      setPollOptions(["", ""]);
    }
    toast("Draft loaded");
  };

  const handleDeleteDraft = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteDraft(id);
    if (activeDraftId === id) {
      setActiveDraftId(null);
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setIsAnonymous(false);
      setActiveTab("text");
      setMediaUrl("");
      setPollOptions(["", ""]);
    }
    setDrafts(getDrafts());
    toast("Draft deleted");
  };

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Create a Post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Share your thoughts, ask questions, post updates, or start surveys with the community.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Creation Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Anonymity Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">Posting As</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card A: Publish as User */}
              <button
                type="button"
                onClick={() => setIsAnonymous(false)}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  !isAnonymous
                    ? "border-blue-600 bg-blue-50/5 dark:bg-blue-950/20 ring-1 ring-blue-600"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted text-xl shrink-0">
                  {currentUser?.avatar || "👾"}
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    Publish as {currentUser?.name || "Chloe Tan"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Your name and avatar will be visible on the post.
                  </p>
                </div>
              </button>

              {/* Card B: Publish Anonymously */}
              <button
                type="button"
                onClick={() => setIsAnonymous(true)}
                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isAnonymous
                    ? "border-blue-600 bg-blue-50/5 dark:bg-blue-950/20 ring-1 ring-blue-600"
                    : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted text-xl shrink-0">
                  👤
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-foreground">Publish Anonymously</p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    Your post will be anonymous. Your profile details remain hidden.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Post tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md h-9">
              <TabsTrigger value="text" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Text
              </TabsTrigger>
              <TabsTrigger value="image" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Images & Videos
              </TabsTrigger>
              <TabsTrigger value="link" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Link
              </TabsTrigger>
              <TabsTrigger value="poll" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Poll
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="post-title" className="text-sm font-bold text-foreground">
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
                className="focus-visible:ring-blue-500 border-border h-10 text-sm"
              />
            </div>

            {/* Dynamic rendering of other inputs */}
            {activeTab === "text" && (
              <div className="space-y-2">
                <Label className="text-sm font-bold text-foreground">Question Body</Label>
                <div className="border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  {/* Editor Toolbar */}
                  <div className="flex items-center gap-1 bg-muted/40 p-2 border-b border-border flex-wrap">
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
                    <span className="w-px h-5 bg-border mx-1" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => insertMarkdown("- ", "")}
                      title="Bullet List"
                    >
                      <ListBulletsIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => insertMarkdown("1. ", "")}
                      title="Numbered List"
                    >
                      <ListNumbersIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                      onClick={() => insertMarkdown("`", "`")}
                      title="Inline Code"
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
                    className="border-0 focus-visible:ring-0 rounded-t-none min-h-[220px] p-4 text-sm resize-y"
                  />
                </div>
              </div>
            )}

            {activeTab === "image" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-url" className="text-sm font-bold text-foreground">
                    Image/Video URL
                  </Label>
                  <Input
                    id="image-url"
                    placeholder="https://example.com/image.jpg"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="focus-visible:ring-blue-500 border-border h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-description" className="text-sm font-bold text-foreground">
                    Description / Caption
                  </Label>
                  <Textarea
                    id="image-description"
                    placeholder="Add a description or caption for your image/video..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="focus-visible:ring-blue-500 border-border min-h-[120px] p-4 text-sm resize-y"
                  />
                </div>
              </div>
            )}

            {activeTab === "link" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="link-url" className="text-sm font-bold text-foreground">
                    External Link URL
                  </Label>
                  <Input
                    id="link-url"
                    placeholder="https://github.com"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="focus-visible:ring-blue-500 border-border h-10 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-description" className="text-sm font-bold text-foreground">
                    Description / Commentary
                  </Label>
                  <Textarea
                    id="link-description"
                    placeholder="Add some description or commentary about this link..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="focus-visible:ring-blue-500 border-border min-h-[120px] p-4 text-sm resize-y"
                  />
                </div>
              </div>
            )}

            {activeTab === "poll" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Poll Options Editor</Label>
                  <div className="space-y-2 bg-muted/10 p-3 rounded-lg border border-border">
                    {pollOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-16 shrink-0">Option {idx + 1}</span>
                        <Input
                          placeholder={`Option ${idx + 1} text`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...pollOptions];
                            newOptions[idx] = e.target.value;
                            setPollOptions(newOptions);
                          }}
                          className="focus-visible:ring-blue-500 border-border h-10 text-sm flex-1"
                        />
                        {pollOptions.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = pollOptions.filter((_, i) => i !== idx);
                              setPollOptions(newOptions);
                            }}
                            className="border-border text-muted-foreground hover:text-destructive hover:border-destructive text-xs h-9 px-3 shrink-0"
                          >
                            <TrashIcon className="h-3.5 w-3.5 mr-1" />
                            Remove Option
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
                              setPollOptions([...pollOptions, ""]);
                            }
                          }}
                          className="border-border hover:bg-blue-50 hover:text-blue-600 transition-colors text-xs"
                        >
                          Add Option
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poll-description" className="text-sm font-bold text-foreground">
                    Description / Context
                  </Label>
                  <Textarea
                    id="poll-description"
                    placeholder="Add some context or details for this poll..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="focus-visible:ring-blue-500 border-border min-h-[120px] p-4 text-sm resize-y"
                  />
                </div>
              </div>
            )}

            {/* Tags Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-bold text-foreground">Tags (Max 5)</Label>
              <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-muted/20">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Badge
                      key={tag}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => handleTagToggle(tag)}
                      className={`cursor-pointer transition-colors text-xs py-1 px-2.5 font-normal ${
                        isSelected
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border-border hover:bg-blue-50 hover:text-blue-600 text-muted-foreground"
                      }`}
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                onClick={handlePost}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 h-10 px-5"
              >
                <PaperPlaneTiltIcon className="h-4 w-4" weight="bold" />
                Post
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="border-border hover:bg-blue-50 hover:text-blue-600 transition-colors gap-1.5 h-10"
              >
                <FloppyDiskIcon className="h-4 w-4" />
                Save draft
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar drafts */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Your Saved Drafts
          </h2>
          <div className="space-y-3">
            {drafts.length === 0 ? (
              <p className="text-xs text-muted-foreground bg-muted/20 p-3 rounded-lg border border-dashed border-border">
                No active drafts.
              </p>
            ) : (
              drafts.map((draft) => (
                <div
                  key={draft.id}
                  onClick={() => handleLoadDraft(draft)}
                  className={`p-3 border rounded-lg text-left cursor-pointer transition-all hover:bg-muted/40 ${
                    activeDraftId === draft.id ? "border-blue-500 bg-blue-50/10" : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="text-xs font-bold text-foreground line-clamp-1">
                      {draft.title || "(Untitled Draft)"}
                    </span>
                    <button
                      onClick={(e) => handleDeleteDraft(e, draft.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
                    {draft.content || (draft.postType === "image" || draft.postType === "link" ? draft.mediaUrl : draft.postType === "poll" ? `Poll: ${draft.pollOptions?.map(o => o.text).filter(Boolean).join(', ') || "No options"}` : "Empty content")}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
