import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET() {
  try {
    await connectMongo();
    const posts = await Post.find({})
      .populate("author", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'writer') {
      return NextResponse.json({ message: "Unauthorized: Only writers can create posts" }, { status: 403 });
    }

    const { title, content, imageUrl } = await req.json();

    if (!title || !content) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectMongo();

    const newPost = await Post.create({
      title,
      content,
      imageUrl,
      author: session.user.id,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json({ message: "An error occurred while creating the post" }, { status: 500 });
  }
}
