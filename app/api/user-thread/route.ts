
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { User } from "@/app/model/model";
import database_connect from "@/app/db";



export async function GET() {
  const current_user = await currentUser();
  if (!current_user) {
    return NextResponse.json({ success: false, message: "Unothorised user" }, { status: 401 });
  }
  try {
    
  
  await database_connect();
  //get user thread fro database
  const user_thread = await User.findOne({ UserId: current_user.id });
  //if exist return it
  if (user_thread) {
    return NextResponse.json({ userThread: user_thread, success: true }, { status: 200 });
  }
  //if not exist create it
  const openai = new OpenAI();
  const thread = await openai.beta.threads.create();
  const add_user = new User({
    UserId: current_user.id,
    ThreadId: thread.id,
  })
  await add_user.save();
  return NextResponse.json({ userThread: add_user, success: true }, { status: 201 });
} catch (error) {
  console.error(error);
  return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    
}


}

