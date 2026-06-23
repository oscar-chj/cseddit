export interface User {
  id: string
  name: string
  username: string
  title: string
  bio: string
  avatar: string // emoji or image URL placeholder
  badges: string[] // e.g. ['👾', '❤️', '🔥', '👌']
  reputation: number
  likes: number
  dislikes: number
  anonymousByDefault: boolean
  department: string
  course: string
  yearOfStudy: string
}

export interface Post {
  id: string
  title: string
  content: string
  tags: string[]
  authorId: string // can be 'anonymous'
  authorName: string
  authorAvatar: string
  timestamp: number
  upvotes: string[] // array of userIds who upvoted
  downvotes: string[] // array of userIds who downvoted
  isFeatured: boolean
  postType?: "text" | "image" | "link" | "poll"
  mediaUrl?: string
  pollOptions?: { text: string; votes: string[] }[]
  authorDepartment?: string
  authorYearOfStudy?: string
}

export interface Answer {
  id: string
  postId: string
  content: string
  authorId: string // can be 'anonymous'
  authorName: string
  authorAvatar: string
  timestamp: number
  upvotes: string[] // array of userIds who upvoted
  downvotes: string[] // array of userIds who downvoted
}

export interface Comment {
  id: string
  parentId: string // can be postId or answerId
  content: string
  authorId: string
  authorName: string
  authorAvatar: string
  timestamp: number
}

export interface Draft {
  id: string
  title: string
  content: string
  tags: string[]
  isAnonymous: boolean
  postType?: "text" | "image" | "link" | "poll"
  mediaUrl?: string
  pollOptions?: { text: string; votes: string[] }[]
  authorDepartment?: string
  authorYearOfStudy?: string
}

export interface AnswerWithComments extends Answer {
  comments: Comment[]
}

export interface PostDetail extends Post {
  comments: Comment[]
  answers: AnswerWithComments[]
}
