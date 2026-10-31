export type Article = { id: string; title: string; slug: string; summary?: string; category: string; publishedAt?: string };
export type ArticleDetail = Article & { content: string };
export type Clinic = { id: string; name: string; address: string; municipality?: string; phone?: string; whatsapp?: string; emergencyAvailable: boolean; lastVerifiedAt?: string };
export type ChatSource = Pick<Article, "title" | "slug" | "category">;
export type ChatMessage = { id: number; role: "user" | "assistant"; content: string; urgency?: "urgent" | "general"; sources?: ChatSource[]; failed?: boolean };
export type ChatReply = { answer: string; urgency?: string; sources?: ChatSource[]; error?: string; fallback?: string };
