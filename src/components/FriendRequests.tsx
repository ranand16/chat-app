"use client";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

interface FriendRequestsProps {
  incomingUserDetails: IncomingFriendRequests[];
  sessionId: string;
}

const FriendRequests: FC<FriendRequestsProps> = ({ incomingUserDetails }) => {
  const router = useRouter();
  const [incomingFriendRequest, setFriendRequests] =
    useState<IncomingFriendRequests[]>(incomingUserDetails);

  const acceptFriendReq = async (senderId: string) => {
    await axios.post("/api/requests/accept", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((req) => req.senderId !== senderId)
    );
    router.refresh();
  };

  const denyFriendReq = async (senderId: string) => {
    await axios.post("/api/requests/deny", { id: senderId });
    setFriendRequests((prev) =>
      prev.filter((req) => req.senderId !== senderId)
    );
    router.refresh();
  };
  return (
    <>
      {incomingFriendRequest.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here</p>
      ) : (
        incomingFriendRequest.map((req) => {
          return (
            <div key={req.senderId} className="flex gap-4 items-center">
              <UserPlus className="text-black" />
              <p className="font-medium text-lg">{req.senderEmail}</p>
              <button
                aria-label="accept friend"
                className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md"
                onClick={() => acceptFriendReq(req.senderId)}
              >
                <Check className="font-semibold text-white w-3/4 h-3/4" />
              </button>
              <button
                aria-label="deny friend"
                className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md"
                onClick={() => denyFriendReq(req.senderId)}
              >
                <X className="font-semibold text-white w-3/4 h-3/4" />
              </button>
            </div>
          );
        })
      )}
    </>
  );
};

export default FriendRequests;
