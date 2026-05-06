import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    await connectMongo();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'reader',
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Signup error details:", error);
    return NextResponse.json({ 
      message: "An error occurred during signup", 
      error: error.message 
    }, { status: 500 });
  }
}
