"use client";
import React, { useState, useEffect, useRef } from "react";
import { IoCallOutline, IoSend } from "react-icons/io5";
import { LuVideo } from "react-icons/lu";
import { PiDotsThreeOutlineFill } from "react-icons/pi";
import { useSelector } from "react-redux";
import io from "socket.io-client";

const socket = io();

const Chatconv = ({
  selectedProfileId,
  selectedProfileData,
  setLastMessageTime,
}) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useSelector((state) => state.user.user);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const receiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive_message", (message) => {
      setMessages((prev) => {
        if (
          prev.some(
            (msg) =>
              msg.timestamp === message.timestamp &&
              msg.content === message.content
          )
        ) {
          return prev;
        }
        return [...prev, message];
      });
    });

    return () => {
      socket.off("receive_message", receiveMessage);
    };
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `/api/get-message?senderId=${user._id}&receiverId=${selectedProfileId}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data);

          if (data.length > 0) {
            const lastMessage = data[data.length - 1];
            const formattedTimestamp = new Date(lastMessage.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            setLastMessageTime(formattedTimestamp);
          }
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    if (selectedProfileId) {
      fetchMessages();
    }
  }, [user._id, selectedProfileId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (message.trim() !== "") {
      const senderId = user._id;
      const receiverId = selectedProfileId;
      const content = message;
      const timestamp = new Date().toISOString();
      const now = new Date();
      const formattedTimestamp = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      try {
        const response = await fetch("/api/send-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId,
            receiverId,
            content,
            timestamp,
            read: false,
          }),
        });

        if (response.ok) {
          const newMessage = {
            sender: user,
            receiver: selectedProfileId,
            content: message,
            timestamp,
          };
          setMessages((prev) => [...prev, newMessage]);
          
        
          setLastMessageTime(formattedTimestamp);

          socket.emit("send_message", newMessage);
          setMessage("");
        } else {
          console.error("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  const handleDeleteMessages = async () => {
    try {
      const response = await fetch("/api/delete-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
        }),
      });

      if (response.ok) {
        setIsDropdownOpen(false);
      } else {
        console.error("Failed to delete messages");
      }
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex flex-col justify-between h-full">
      {selectedProfileId === user._id ? (
        <div className="flex flex-col items-center justify-center h-full">
          <img
            src="/computermessaging.jpg"
            alt="Computer Messaging"
            className="w-1/2 h-auto"
          />
          <p className="text-gray-500 mt-4">
            Choose someone and start conversation
          </p>
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center p-2 border-b-[1px] w-full gap-3 relative">
              <div className="w-16">
                <img
                  className="w-full rounded-full"
                  src={selectedProfileData?.profilePhoto || "/profilephoto.jpg"}
                  alt="Profile"
                />
              </div>
              <div>
                <p className="font-semibold w-32">
                  {selectedProfileData?.name} {selectedProfileData?.surname}
                </p>
              </div>
              <div className="w-full items-center gap-5 text-2xl mr-3 flex justify-end">
                <IoCallOutline />
                <LuVideo />
                <PiDotsThreeOutlineFill
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="cursor-pointer"
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-[5rem]  mr-3 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <ul className="py-2 ">
                    <li
                      onClick={handleDeleteMessages}
                      className="px-4 h-full  hover:text-red-500 duration-100 cursor-pointer"
                    >
                      Delete all messages
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className="p-4 flex flex-col gap-3 h-[76vh] overflow-y-auto scrollbar-hide">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender._id === user._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`w-fit p-3 rounded-2xl text-white ${
                        msg.sender._id === user._id
                          ? "bg-[#4b4b4b]"
                          : "bg-blue-500"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className="text-xs text-gray-300 text-right mt-1">
                        {formatTimestamp(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center">
                  No messages yet. Start the conversation!
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="flex items-center p-4 gap-2">
            <input
              type="text"
              className="w-full p-2 border-[#c1bfbf] border rounded-full focus:outline-none"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button
              className="text-2xl text-blue-500 p-2"
              onClick={handleSendMessage}
            >
              <IoSend />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chatconv;
