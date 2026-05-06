import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectMongo from "@/lib/mongodb";
import Post from "@/models/Post";

export async function POST(
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

    if (!post.likes) {
      post.likes = [];
    }

    const userId = session.user.id;
    const isLiked = post.likes.some((uid: any) => uid.toString() === userId);

    if (isLiked) {
      // Unlike
      post.likes.pull(userId);
    } else {
      // Like
      post.likes.push(userId);
    }

    await post.save();

    return NextResponse.json({ 
      likesCount: post.likes.length,
      isLiked: !isLiked 
    });
  } catch (error) {
    console.error("Like post error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
