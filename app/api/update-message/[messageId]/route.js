import { NextResponse } from "next/server";
import connect from "@/db";
import Message from "@/models/Message";

export const PATCH = async (request) => {
  try {
    await connect();

    const messageId = request.nextUrl.pathname.split("/").pop();

    if (!messageId) {
      return new NextResponse(
        JSON.stringify({ message: "Message ID is required" }),
        { status: 400 }
      );
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { read: true },
      { new: true }
    );

    if (!updatedMessage) {
      return new NextResponse(
        JSON.stringify({ message: "Message not found" }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "Message updated", updatedMessage }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
};
