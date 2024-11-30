import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST() {
 try {
  const openai = new OpenAI();
  const thread = await openai.beta.threads.create();

  return NextResponse.json({ userthread: thread,success:true }, { status: 201 });
  
 } catch (error) {
  console.error(error);
  return NextResponse.json({ error: "Failed to create thread", success: false }, { status: 500 });
  
 }
}