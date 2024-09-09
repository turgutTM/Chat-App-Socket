import { NextResponse } from "next/server";
import Message from "@/models/Message";
import connect from "@/db";

export const POST = async (req) => {
  try {
    await connect();

    const { userId } = await req.json();

    await Message.updateMany(
      { sender: userId },
      { $set: { senderDeleted: true } }
    );

    await Message.updateMany(
      { receiver: userId },
      { $set: { receiverDeleted: true } }
    );

    return new NextResponse(
      JSON.stringify({ message: "Messages cleared for the user" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error clearing messages:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
};
