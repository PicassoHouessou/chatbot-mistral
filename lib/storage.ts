import { Conversation, Message } from "@/types";

export async function fetchConversations(): Promise<Conversation[]> {
  const res = await fetch("/api/conversations");
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((c: any) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    messages: c.messages.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    })),
  }));
}

export async function createConversation(title?: string): Promise<Conversation> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title || "Nouvelle discussion" }),
  });
  const data = await res.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    messages: [],
  };
}

export async function updateConversation(
  id: string,
  title: string,
  messages: Message[]
): Promise<void> {
  await fetch(`/api/conversations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, messages }),
  });
}

export async function deleteConversation(id: string): Promise<void> {
  await fetch(`/api/conversations/${id}`, { method: "DELETE" });
}

export function generateTitle(firstMessage: string): string {
  return firstMessage.length > 40
    ? firstMessage.substring(0, 40) + "..."
    : firstMessage;
}
