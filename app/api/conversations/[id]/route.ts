import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/mongodb";
import { Conversation } from "@/lib/models/Conversation";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = (session.user as any).email;
  const { title, messages } = await req.json();

  const conv = await Conversation.findOneAndUpdate(
    { _id: params.id, userId },
    { title, messages, updatedAt: new Date() },
    { new: true }
  );

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: conv._id.toString(),
    title: conv.title,
    messages: conv.messages,
    createdAt: conv.createdAt,
    updatedAt: conv.updatedAt,
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const userId = (session.user as any).email;

  const result = await Conversation.deleteOne({ _id: params.id, userId });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
