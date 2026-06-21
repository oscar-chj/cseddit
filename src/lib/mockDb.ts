import { User, Post, Answer, Comment, Draft, PostDetail } from "@/types";

const isServer = typeof window === "undefined";

function getRaw<T>(key: string, defaultValue: T): T {
  if (isServer) return defaultValue;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setRaw<T>(key: string, value: T): void {
  if (isServer) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to write to localStorage", e);
  }
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
}

function resolveAuthorInfo<T extends { authorId: string; authorName: string; authorAvatar: string }>(
  item: T,
  users: User[]
): T {
  if (item.authorId === "anonymous") {
    return {
      ...item,
      authorName: "Anonymous",
      authorAvatar: "👤",
    };
  }
  const user = users.find((u) => u.id === item.authorId);
  if (user) {
    return {
      ...item,
      authorName: user.name,
      authorAvatar: user.avatar,
    };
  }
  return item;
}

function recalculateUserStats(userId: string): void {
  if (isServer || !userId || userId === "anonymous") return;

  const users = getRaw<User[]>("cseddit_users", []);
  const posts = getRaw<Post[]>("cseddit_posts", []);
  const answers = getRaw<Answer[]>("cseddit_answers", []);

  const userIndex = users.findIndex((u) => u.id === userId);
  if (userIndex === -1) return;

  const user = users[userIndex];
  const answersCount = answers.filter((a) => a.authorId === userId).length;

  let likesCount = 0;
  let dislikesCount = 0;

  posts.forEach((p) => {
    if (p.authorId === userId) {
      likesCount += p.upvotes.length;
      dislikesCount += p.downvotes.length;
    }
  });

  answers.forEach((a) => {
    if (a.authorId === userId) {
      likesCount += a.upvotes.length;
      dislikesCount += a.downvotes.length;
    }
  });

  user.likes = likesCount;
  user.dislikes = dislikesCount;
  user.reputation = answersCount + likesCount - dislikesCount;

  users[userIndex] = user;
  setRaw("cseddit_users", users);
}

function recalculateAllUsersStats(): void {
  if (isServer) return;
  const users = getRaw<User[]>("cseddit_users", []);
  const posts = getRaw<Post[]>("cseddit_posts", []);
  const answers = getRaw<Answer[]>("cseddit_answers", []);

  const updatedUsers = users.map((user) => {
    const userId = user.id;
    const answersCount = answers.filter((a) => a.authorId === userId).length;

    let likesCount = 0;
    let dislikesCount = 0;

    posts.forEach((p) => {
      if (p.authorId === userId) {
        likesCount += p.upvotes.length;
        dislikesCount += p.downvotes.length;
      }
    });

    answers.forEach((a) => {
      if (a.authorId === userId) {
        likesCount += a.upvotes.length;
        dislikesCount += a.downvotes.length;
      }
    });

    return {
      ...user,
      likes: likesCount,
      dislikes: dislikesCount,
      reputation: answersCount + likesCount - dislikesCount,
    };
  });

  setRaw("cseddit_users", updatedUsers);
}

export function initializeDb(force = false): void {
  if (isServer) return;

  if (force || !localStorage.getItem("cseddit_posts")) {
    const seedUsers: User[] = [
      {
        id: "chloe_tan",
        name: "Chloe Tan",
        username: "chloetan",
        title: "Computer Science Student",
        bio: "UI/UX enthusiast and Frontend Developer. Love building sleek, user-friendly interfaces.",
        avatar: "👾",
        badges: ["👾", "❤️", "🔥", "👌"],
        reputation: 0,
        likes: 0,
        dislikes: 0,
        anonymousByDefault: false,
      },
      {
        id: "alex_mercer",
        name: "Alex Mercer",
        username: "alexmercer",
        title: "Senior Software Engineer",
        bio: "Full-stack developer specializing in Next.js and distributed systems. Always optimization-first.",
        avatar: "🔥",
        badges: ["🔥", "👌"],
        reputation: 0,
        likes: 0,
        dislikes: 0,
        anonymousByDefault: false,
      },
      {
        id: "sarah_connor",
        name: "Sarah Connor",
        username: "sconnor",
        title: "Cybersecurity Expert",
        bio: "Defending networks and coding in Rust.",
        avatar: "🛡️",
        badges: ["👾", "👌"],
        reputation: 0,
        likes: 0,
        dislikes: 0,
        anonymousByDefault: false,
      },
      {
        id: "john_doe",
        name: "John Doe",
        username: "johndoe",
        title: "Intro to CS TA",
        bio: "Helping students debug their first programs and understand pointers.",
        avatar: "💻",
        badges: ["❤️"],
        reputation: 0,
        likes: 0,
        dislikes: 0,
        anonymousByDefault: false,
      },
    ];

    const now = Date.now();
    const seedPosts: Post[] = [
      {
        id: "post_1",
        title: "Optimizing Next.js SSR Hydration Performance",
        content:
          "I am working on a complex data visualization dashboard in Next.js. The page takes quite long to hydrate because of a large initial state. What are some of the best practices to reduce hydration time or defer hydration for non-critical elements?",
        tags: ["Next.js", "React", "Frontend", "Performance"],
        authorId: "chloe_tan",
        authorName: "Chloe Tan",
        authorAvatar: "👾",
        timestamp: now - 24 * 60 * 60 * 1000 * 2, // 2 days ago
        upvotes: ["alex_mercer", "sarah_connor"],
        downvotes: [],
        isFeatured: true,
      },
      {
        id: "post_2",
        title: "Why is my Rust binary so large, and how can I optimize it?",
        content:
          "I recently wrote a simple CLI tool in Rust. The binary compiled in release mode is around 4MB. That feels quite large for a basic file parser. What compiler flags or optimization tricks can I use to shrink the size?",
        tags: ["Rust", "Systems", "Compiler"],
        authorId: "alex_mercer",
        authorName: "Alex Mercer",
        authorAvatar: "🔥",
        timestamp: now - 12 * 60 * 60 * 1000, // 12 hours ago
        upvotes: ["chloe_tan", "sarah_connor", "john_doe"],
        downvotes: [],
        isFeatured: false,
      },
      {
        id: "post_3",
        title: "SQL Query optimization: Indexing a composite key",
        content:
          "I have a large table with millions of rows. Querying by (user_id, status, created_at) is slow. Should I create a composite index on all three columns? What order of columns should I use in the composite index?",
        tags: ["SQL", "Database", "Backend"],
        authorId: "sarah_connor",
        authorName: "Sarah Connor",
        authorAvatar: "🛡️",
        timestamp: now - 36 * 60 * 60 * 1000, // 36 hours ago
        upvotes: ["alex_mercer"],
        downvotes: ["john_doe"],
        isFeatured: false,
      },
    ];

    const seedAnswers: Answer[] = [
      {
        id: "answer_1",
        postId: "post_1",
        content:
          "To optimize Next.js hydration, you should first identify which components are causing the bottleneck. You can use React DevTools Profiler. Additionally:\n\n1. Defer non-critical components using `next/dynamic` with `ssr: false`.\n2. Ensure you are not mismatching server and client HTML (e.g. using `window` during initial render).\n3. Keep your serialized props (JSON) as small as possible.",
        authorId: "alex_mercer",
        authorName: "Alex Mercer",
        authorAvatar: "🔥",
        timestamp: now - 23 * 60 * 60 * 1000,
        upvotes: ["chloe_tan"],
        downvotes: [],
      },
      {
        id: "answer_2",
        postId: "post_2",
        content:
          "You can try the following steps to optimize your Rust binary size:\n- Strip symbols using `strip = true` in Cargo.toml under `[profile.release]`.\n- Enable Link Time Optimization (LTO) using `lto = true`.\n- Set codegen-units to 1 to allow more optimization opportunities.",
        authorId: "chloe_tan",
        authorName: "Chloe Tan",
        authorAvatar: "👾",
        timestamp: now - 10 * 60 * 60 * 1000,
        upvotes: ["alex_mercer", "sarah_connor"],
        downvotes: [],
      },
    ];

    const seedComments: Comment[] = [
      {
        id: "comment_1",
        parentId: "post_1",
        content:
          "Are you using any charting libraries? Some of them have massive bundle sizes and cause huge hydration delays.",
        authorId: "sarah_connor",
        authorName: "Sarah Connor",
        authorAvatar: "🛡️",
        timestamp: now - 23.5 * 60 * 60 * 1000,
      },
      {
        id: "comment_2",
        parentId: "answer_1",
        content:
          "Thanks Alex! Using next/dynamic with ssr: false for the heavy charts widget worked wonders!",
        authorId: "chloe_tan",
        authorName: "Chloe Tan",
        authorAvatar: "👾",
        timestamp: now - 22 * 60 * 60 * 1000,
      },
    ];

    setRaw("cseddit_users", seedUsers);
    setRaw("cseddit_posts", seedPosts);
    setRaw("cseddit_answers", seedAnswers);
    setRaw("cseddit_comments", seedComments);
    setRaw("cseddit_drafts", []);
    setRaw("cseddit_current_user_id", "chloe_tan");

    recalculateAllUsersStats();
  }
}

export function resetDb(): void {
  if (isServer) return;
  localStorage.removeItem("cseddit_users");
  localStorage.removeItem("cseddit_posts");
  localStorage.removeItem("cseddit_answers");
  localStorage.removeItem("cseddit_comments");
  localStorage.removeItem("cseddit_drafts");
  localStorage.removeItem("cseddit_current_user_id");
  initializeDb(true);
}

export function getCurrentUserId(): string {
  return getRaw<string>("cseddit_current_user_id", "chloe_tan");
}

export function setCurrentUserId(userId: string): void {
  setRaw("cseddit_current_user_id", userId);
}

export function getCurrentUser(): User | null {
  const currentId = getCurrentUserId();
  return getUserById(currentId);
}

export function getPosts(): Post[] {
  initializeDb();
  const posts = getRaw<Post[]>("cseddit_posts", []);
  const users = getRaw<User[]>("cseddit_users", []);
  return posts.map((p) => resolveAuthorInfo(p, users));
}

export function getPostById(id: string): PostDetail | null {
  initializeDb();
  const posts = getRaw<Post[]>("cseddit_posts", []);
  const post = posts.find((p) => p.id === id);
  if (!post) return null;

  const users = getRaw<User[]>("cseddit_users", []);
  const resolvedPost = resolveAuthorInfo(post, users);

  const answers = getRaw<Answer[]>("cseddit_answers", []);
  const comments = getRaw<Comment[]>("cseddit_comments", []);

  const postComments = comments
    .filter((c) => c.parentId === id)
    .map((c) => resolveAuthorInfo(c, users));

  const postAnswers = answers
    .filter((a) => a.postId === id)
    .map((a) => {
      const resolvedAnswer = resolveAuthorInfo(a, users);
      return {
        ...resolvedAnswer,
        comments: comments
          .filter((c) => c.parentId === a.id)
          .map((c) => resolveAuthorInfo(c, users)),
      };
    });

  return {
    ...resolvedPost,
    comments: postComments,
    answers: postAnswers,
  };
}

export function createPost(
  postInput: Omit<Post, "id" | "timestamp" | "upvotes" | "downvotes" | "authorName" | "authorAvatar" | "isFeatured"> & { isFeatured?: boolean }
): Post {
  initializeDb();
  const posts = getRaw<Post[]>("cseddit_posts", []);
  const id = generateUUID();
  const newPost: Post = {
    ...postInput,
    id,
    timestamp: Date.now(),
    upvotes: [],
    downvotes: [],
    authorName: "",
    authorAvatar: "",
    isFeatured: postInput.isFeatured ?? false,
  };
  posts.unshift(newPost);
  setRaw("cseddit_posts", posts);
  recalculateUserStats(postInput.authorId);
  return newPost;
}

export function updatePost(post: Post): void {
  initializeDb();
  const posts = getRaw<Post[]>("cseddit_posts", []);
  const index = posts.findIndex((p) => p.id === post.id);
  if (index !== -1) {
    const oldAuthorId = posts[index].authorId;
    posts[index] = post;
    setRaw("cseddit_posts", posts);
    recalculateUserStats(post.authorId);
    if (oldAuthorId !== post.authorId) {
      recalculateUserStats(oldAuthorId);
    }
  }
}

export function deletePost(id: string): void {
  initializeDb();
  const posts = getRaw<Post[]>("cseddit_posts", []);
  const post = posts.find((p) => p.id === id);
  if (!post) return;

  const updatedPosts = posts.filter((p) => p.id !== id);
  setRaw("cseddit_posts", updatedPosts);

  const answers = getRaw<Answer[]>("cseddit_answers", []);
  const postAnswers = answers.filter((a) => a.postId === id);
  const remainingAnswers = answers.filter((a) => a.postId !== id);
  setRaw("cseddit_answers", remainingAnswers);

  const comments = getRaw<Comment[]>("cseddit_comments", []);
  const answerIds = postAnswers.map((a) => a.id);
  const remainingComments = comments.filter(
    (c) => c.parentId !== id && !answerIds.includes(c.parentId)
  );
  setRaw("cseddit_comments", remainingComments);

  recalculateUserStats(post.authorId);
  postAnswers.forEach((ans) => {
    recalculateUserStats(ans.authorId);
  });
}

export function createAnswer(
  answerInput: Omit<Answer, "id" | "timestamp" | "upvotes" | "downvotes" | "authorName" | "authorAvatar">
): Answer {
  initializeDb();
  const answers = getRaw<Answer[]>("cseddit_answers", []);
  const id = generateUUID();
  const newAnswer: Answer = {
    ...answerInput,
    id,
    timestamp: Date.now(),
    upvotes: [],
    downvotes: [],
    authorName: "",
    authorAvatar: "",
  };
  answers.push(newAnswer);
  setRaw("cseddit_answers", answers);
  recalculateUserStats(answerInput.authorId);
  return newAnswer;
}

export function createComment(
  commentInput: Omit<Comment, "id" | "timestamp" | "authorName" | "authorAvatar">
): Comment {
  initializeDb();
  const comments = getRaw<Comment[]>("cseddit_comments", []);
  const id = generateUUID();
  const newComment: Comment = {
    ...commentInput,
    id,
    timestamp: Date.now(),
    authorName: "",
    authorAvatar: "",
  };
  comments.push(newComment);
  setRaw("cseddit_comments", comments);
  return newComment;
}

export function votePost(
  postId: string,
  userId: string,
  type: "up" | "down"
): void {
  if (!userId || userId === "anonymous") return;
  initializeDb();
  const posts = getRaw<Post[]>("cseddit_posts", []);
  const post = posts.find((p) => p.id === postId);
  if (!post) return;
  if (post.authorId === userId) return;

  const alreadyUpvoted = post.upvotes.includes(userId);
  const alreadyDownvoted = post.downvotes.includes(userId);

  if (type === "up") {
    if (alreadyUpvoted) {
      post.upvotes = post.upvotes.filter((id) => id !== userId);
    } else {
      post.upvotes.push(userId);
      if (alreadyDownvoted) {
        post.downvotes = post.downvotes.filter((id) => id !== userId);
      }
    }
  } else if (type === "down") {
    if (alreadyDownvoted) {
      post.downvotes = post.downvotes.filter((id) => id !== userId);
    } else {
      post.downvotes.push(userId);
      if (alreadyUpvoted) {
        post.upvotes = post.upvotes.filter((id) => id !== userId);
      }
    }
  }

  setRaw("cseddit_posts", posts);
  recalculateUserStats(post.authorId);
}

export function voteAnswer(
  answerId: string,
  userId: string,
  type: "up" | "down"
): void {
  if (!userId || userId === "anonymous") return;
  initializeDb();
  const answers = getRaw<Answer[]>("cseddit_answers", []);
  const answer = answers.find((a) => a.id === answerId);
  if (!answer) return;
  if (answer.authorId === userId) return;

  const alreadyUpvoted = answer.upvotes.includes(userId);
  const alreadyDownvoted = answer.downvotes.includes(userId);

  if (type === "up") {
    if (alreadyUpvoted) {
      answer.upvotes = answer.upvotes.filter((id) => id !== userId);
    } else {
      answer.upvotes.push(userId);
      if (alreadyDownvoted) {
        answer.downvotes = answer.downvotes.filter((id) => id !== userId);
      }
    }
  } else if (type === "down") {
    if (alreadyDownvoted) {
      answer.downvotes = answer.downvotes.filter((id) => id !== userId);
    } else {
      answer.downvotes.push(userId);
      if (alreadyUpvoted) {
        answer.upvotes = answer.upvotes.filter((id) => id !== userId);
      }
    }
  }

  setRaw("cseddit_answers", answers);
  recalculateUserStats(answer.authorId);
}

export function getUsers(): User[] {
  initializeDb();
  const users = getRaw<User[]>("cseddit_users", []);
  return [...users].sort((a, b) => b.reputation - a.reputation);
}

export function getUserById(id: string): User | null {
  initializeDb();
  const users = getRaw<User[]>("cseddit_users", []);
  return users.find((u) => u.id === id) || null;
}

export function updateUserProfile(
  id: string,
  data: Partial<User>
): User | null {
  initializeDb();
  const users = getRaw<User[]>("cseddit_users", []);
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return null;

  const updatedUser = {
    ...users[index],
    ...data,
    id,
  };
  users[index] = updatedUser;
  setRaw("cseddit_users", users);
  recalculateUserStats(id);
  return updatedUser;
}

export function getDrafts(): Draft[] {
  initializeDb();
  return getRaw<Draft[]>("cseddit_drafts", []);
}

export function saveDraft(
  draftInput: Omit<Draft, "id"> & { id?: string }
): Draft {
  initializeDb();
  const drafts = getRaw<Draft[]>("cseddit_drafts", []);
  let id = draftInput.id;
  if (id) {
    const index = drafts.findIndex((d) => d.id === id);
    if (index !== -1) {
      drafts[index] = { ...draftInput, id };
      setRaw("cseddit_drafts", drafts);
      return drafts[index];
    }
  }

  id = generateUUID();
  const newDraft: Draft = {
    ...draftInput,
    id,
  };
  drafts.push(newDraft);
  setRaw("cseddit_drafts", drafts);
  return newDraft;
}

export function deleteDraft(id: string): void {
  initializeDb();
  const drafts = getRaw<Draft[]>("cseddit_drafts", []);
  const updatedDrafts = drafts.filter((d) => d.id !== id);
  setRaw("cseddit_drafts", updatedDrafts);
}
