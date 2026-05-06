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
    const { text } = await req.json();

    if (!text || text.trim() === "") {
      return NextResponse.json({ message: "Comment text is required" }, { status: 400 });
    }

    await connectMongo();

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    const newComment = {
      user: session.user.id,
      text: text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Return the populated comment for immediate UI update
    // We can't easily populate a single pushed item without refetching or manual mapping
    // But since the client knows the user name, we'll return the comment as is
    // and let the client handle the display
    
    return NextResponse.json({ 
      ...newComment,
      user: { _id: session.user.id, name: session.user.name } 
    }, { status: 201 });

  } catch (error) {
    console.error("Add comment error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
