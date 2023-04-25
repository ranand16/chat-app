"use client";
import { chatHrefContructor } from "@/libs/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface SideBarChatListProps {
  friends: User[];
  sessionId: string;
}

const SideBarChatList: FC<SideBarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMsg((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);
  const [unseenMsg, setUnseenMsg] = useState<Message[]>([]);
  return (
    <ul className="max-h-[25rem] overflow-y-auto -mx-2 space-y-1 " role="list">
      {friends.sort().map((f) => {
        const unseenMsgsCount = unseenMsg.filter((usm) => {
          return usm.senderId === f.id;
        }).length;
        return (
          <li key={f.id}>
            <a
              href={`/dashboard/chat/${chatHrefContructor(sessionId, f.id)}`}
              className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              {f.name}
              {unseenMsgsCount > 0 && (
                <div className="bg-infigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                  {unseenMsgsCount}
                </div>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SideBarChatList;
