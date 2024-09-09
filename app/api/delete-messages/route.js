import { NextResponse } from "next/server";
import Message from "@/models/Message";
import connect from "@/db";

export const DELETE = async (req) => {
  try {
    await connect();

    const { messageIds, userId, isSender } = await req.json();

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return new NextResponse(
        JSON.stringify({ message: "No message IDs provided" }),
        { status: 400 }
      );
    }

    const updateField = isSender
      ? { senderDeleted: true }
      : { receiverDeleted: true };

    const result = await Message.updateMany(
      { _id: { $in: messageIds }, [isSender ? "sender" : "receiver"]: userId },
      { $set: updateField }
    );

    if (result.matchedCount === 0) {
      return new NextResponse(
        JSON.stringify({
          message: "No matching messages found or user not authorized",
        }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "Messages marked as deleted" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting messages:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal server error" }),
      { status: 500 }
    );
  }
};
