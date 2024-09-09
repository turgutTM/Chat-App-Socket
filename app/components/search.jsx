"use client";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FaSearch } from "react-icons/fa";

const Search = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const currentUser = useSelector((state) => state.user.user);
  const currentUserId = currentUser?._id;
  const friendsList = currentUser?.friends || [];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/all-users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() !== "") {
      const normalizedSearchTerm = searchTerm.toLowerCase().trim();
      const searchWords = normalizedSearchTerm.split(/\s+/);

      const results = users
        .filter((user) => user._id !== currentUserId)
        .filter((user) => {
          const normalizedName = `${user.name.toLowerCase()} ${user.surname.toLowerCase()}`;
          return searchWords.every((word) => normalizedName.includes(word));
        });

      setFilteredUsers(results);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users, currentUserId]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddFriend = async (friendId) => {
    try {
      const response = await fetch("/api/send-friend-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUserId, friendId: friendId }),
      });

      if (response.ok) {
        const data = await response.json();
      } else {
        const errorData = await response.json();
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  return (
    <div className="h-full flex flex-col justify-start items-center w-full rounded-2xl bg-gradient-to-br from-gray-100 to-gray-300 pt-20 shadow-lg">
      <div className="relative w-3/4 max-w-lg mb-8">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl" />
        <input
          type="text"
          className="w-full py-3 pl-12 pr-4 rounded-full text-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          placeholder="Search for user"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {searchTerm.trim() !== "" && (
        <div className="w-full flex flex-col items-center gap-6 max-w-lg scrollbar-hide overflow-y-scroll h-[32rem]">
          {filteredUsers.length === 0 ? (
            <p className="text-gray-700">No users found</p>
          ) : (
            filteredUsers.map((user, index) => {
              const isFriend = friendsList.includes(user._id);

              return (
                <div
                  key={user._id}
                  className={`flex w-[18rem] items-center gap-6 bg-white rounded-full shadow-lg max-w-lg transition-transform duration-500 transform opacity-100 translate-y-0 ${
                    index < 4 ? "animate-fade-in" : ""
                  }`}
                >
                  <div className="w-24 h-24 rounded-full border-4 border-blue-200 overflow-hidden shadow-lg">
                    <img
                      src={user.profilePicture || "/batman.jpg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-lg font-semibold mr-6 text-gray-800">
                        {user.name} {user.surname}
                      </p>
                    </div>
                    {isFriend ? (
                      <button
                        className="px-4 py-2 bg-gray-500 mr-5 text-white  rounded-full cursor-not-allowed"
                        disabled
                      >
                        Already a Friend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(user._id)}
                        className="px-4 py-2 bg-blue-600 mr-5 text-white rounded-full hover:bg-blue-700 transition duration-200"
                      >
                        Add Friend
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
