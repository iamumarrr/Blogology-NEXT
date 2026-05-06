import { NextResponse, NextRequest } from "next/server";
import connectMongo from "@/lib/mongodb";
import Post from "@/models/Post";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectMongo();
    const post = await Post.findById(id)
      .populate("author", "name _id")
      .populate("comments.user", "name");
    
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }
    
    // Ensure likes exists for older posts
    if (!post.likes) {
      post.likes = [];
    }
    
    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch post" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectMongo();
    
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check if the user is the author
    if (post.author.toString() !== (session.user as any).id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);
    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Failed to delete post" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, content, imageUrl } = await req.json();
    
    await connectMongo();
    
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    // Check if the user is the author
    if (post.author.toString() !== (session.user as any).id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { title, content, imageUrl },
      { new: true }
    );

    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ message: "Failed to update post" }, { status: 500 });
  }
}
