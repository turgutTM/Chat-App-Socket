"use client";
import React, { useState, useEffect } from "react";
import { IoSearch } from "react-icons/io5";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { useSelector } from "react-redux";

const Chatprofile = ({
  setSelectedProfileId,
  setSelectedProfileData,
  lastmessagetime,
  selectedProfileId, 
}) => {
  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch(`/api/all-friends/${user._id}`);
        if (response.ok) {
          const data = await response.json();
          setFriends(data.friends || []);
        } else {
          console.error("Failed to fetch friends");
        }
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [user._id]);

  const handleProfileClick = async (profileId) => {
    setSelectedProfileId(profileId);
    try {
      const response = await fetch(`/api/user/${profileId}`);
      if (response.ok) {
        const profileData = await response.json();
        setSelectedProfileData(profileData);
      } else {
        console.error("Failed to fetch profile data");
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const filteredFriends = friends.filter((friend) =>
    `${friend.name} ${friend.surname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full gap-4 flex flex-col p-3">
      <div className="flex border bg-slate-200 items-center p-2 gap-2 rounded-[10px]">
        <IoSearch className="text-gray-500 text-2xl" />
        <input
          className="bg-slate-200 focus:outline-none placeholder:text-gray-500 w-full"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="gap-8 flex flex-col">
        {filteredFriends.length > 0 ? (
          filteredFriends.map((friend) => (
            <div
              key={friend._id}
              className="flex gap-3 items-center cursor-pointer"
              onClick={() => handleProfileClick(friend._id)}
            >
              <div className="w-16">
                <img
                  className="w-full rounded-lg"
                  src={friend.profilePhoto || "/profilephoto.jpg"}
                  alt={`${friend.name}'s profile`}
                />
              </div>
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium">{`${friend.name} ${friend.surname}`}</p>
                  {friend.lastMessageStatus === "read" && (
                    <LiaCheckDoubleSolid className="text-2xl text-blue-600" />
                  )}
                  <p className="text-gray-400 text-sm">

                    {selectedProfileId === friend._id ? lastmessagetime : "pm"}
                  </p>
                </div>
                <p className="text-gray-400 w-full whitespace-nowrap overflow-hidden text-ellipsis">
                  {friend.lastMessage || "No recent messages"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No friends found</p>
        )}
      </div>
    </div>
  );
};

export default Chatprofile;
