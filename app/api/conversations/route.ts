import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/Conversation";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = (session.user as any).email;
  const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 }).lean();

  return NextResponse.json(
    conversations.map((c) => ({
      id: (c._id as any).toString(),
      title: c.title,
      messages: c.messages,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = (session.user as any).email;
  const body = await req.json().catch(() => ({}));
  const title = body.title || "Nouvelle discussion";

  const conv = await Conversation.create({ userId, title, messages: [] });

  return NextResponse.json({
    id: conv._id.toString(),
    title: conv.title,
    messages: conv.messages,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  });
}
