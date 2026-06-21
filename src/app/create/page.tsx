"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId, createPost, saveDraft, getDrafts, deleteDraft } from "@/lib/mockDb";
import { Draft } from "@/types";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TextB,
  TextItalic,
  TextUnderline,
  ListBullets,
  ListNumbers,
  Code,
  FloppyDisk,
  PaperPlaneTilt,
  Trash
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [activeTab, setActiveTab] = useState("text");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDrafts(getDrafts());
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
      toast.error("Please enter a question title");
      return;
    }
    if (!content.trim()) {
      toast.error("Please describe your question details");
      return;
    }

    const currentUserId = getCurrentUserId();
    const newPost = createPost({
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      authorId: isAnonymous ? "anonymous" : currentUserId,
      isFeatured: false,
    });

    if (activeDraftId) {
      deleteDraft(activeDraftId);
    }

    toast("Question published");
    router.push(`/posts/${newPost.id}`);
  };

  const handleSaveDraft = () => {
    if (!title.trim() && !content.trim()) {
      toast.error("Cannot save an empty draft");
      return;
    }

    const draft = saveDraft({
      id: activeDraftId || undefined,
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      isAnonymous,
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
    }
    setDrafts(getDrafts());
    toast("Draft deleted");
  };

  if (!mounted) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ask a public question</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Share details of your technical problem to get help from peers.
          </p>
        </div>

        {/* Anonymity Switch */}
        <div className="flex items-center space-x-3 bg-muted/40 p-2 rounded-lg border border-border">
          <Switch
            id="anonymous-toggle"
            checked={isAnonymous}
            onCheckedChange={setIsAnonymous}
            className="data-[state=checked]:bg-blue-600"
          />
          <Label htmlFor="anonymous-toggle" className="text-xs font-semibold cursor-pointer">
            {isAnonymous ? "Publish anonymously" : "Publish as yourself"}
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Creation Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Post tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-md h-9">
              <TabsTrigger value="text" className="text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Text
              </TabsTrigger>
              <TabsTrigger value="image" disabled className="text-xs opacity-50 cursor-not-allowed">
                Images & Videos
              </TabsTrigger>
              <TabsTrigger value="link" disabled className="text-xs opacity-50 cursor-not-allowed">
                Link
              </TabsTrigger>
              <TabsTrigger value="poll" disabled className="text-xs opacity-50 cursor-not-allowed">
                Poll
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="question-title" className="text-sm font-bold text-foreground">
                Title
              </Label>
              <Input
                id="question-title"
                placeholder="e.g. How do I center a div using Tailwind CSS grid?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="focus-visible:ring-blue-500 border-border h-10 text-sm"
              />
            </div>

            {/* Markdown rich text body */}
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
                    <TextB className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    onClick={() => insertMarkdown("*", "*")}
                    title="Italic"
                  >
                    <TextItalic className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    onClick={() => insertMarkdown("<u>", "</u>")}
                    title="Underline"
                  >
                    <TextUnderline className="h-4 w-4" />
                  </Button>
                  <span className="w-px h-5 bg-border mx-1" />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    onClick={() => insertMarkdown("- ", "")}
                    title="Bullet List"
                  >
                    <ListBullets className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    onClick={() => insertMarkdown("1. ", "")}
                    title="Numbered List"
                  >
                    <ListNumbers className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                    onClick={() => insertMarkdown("`", "`")}
                    title="Inline Code"
                  >
                    <Code className="h-4 w-4" />
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
                <PaperPlaneTilt className="h-4 w-4" weight="bold" />
                Post
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                className="border-border hover:bg-blue-50 hover:text-blue-600 transition-colors gap-1.5 h-10"
              >
                <FloppyDisk className="h-4 w-4" />
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
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
                    {draft.content || "Empty content"}
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
