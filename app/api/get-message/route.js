import { NextResponse } from "next/server";
import connect from "@/db";
import Message from "@/models/Message";

export const GET = async (request) => {
  try {
    await connect();

    const url = new URL(request.url);
    const senderId = url.searchParams.get("senderId");
    const receiverId = url.searchParams.get("receiverId");

    if (!senderId || !receiverId) {
      return new NextResponse("Missing senderId or receiverId", {
        status: 400,
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    })
      .populate("sender", "name profilePhoto")
      .populate("receiver", "name profilePhoto")
      .sort({ timestamp: 1 });

    return new NextResponse(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};
