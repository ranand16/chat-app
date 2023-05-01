"use client";
import { pusherClient } from "@/libs/Pusher";
import { chatHrefContructor, pusherKey } from "@/libs/utils";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import UnseenToast from "./UnseenChatToast";

interface EntendedMessage extends Message {
  senderName: string;
  senderImage: string;
}

interface SideBarChatListProps {
  friends: User[];
  sessionId: string;
}

const SideBarChatList: FC<SideBarChatListProps> = ({ friends, sessionId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [unseenMsg, setUnseenMsg] = useState<Message[]>([]);

  useEffect(() => {
    pusherClient.subscribe(pusherKey(`user:${sessionId}:chats`));
    pusherClient.subscribe(pusherKey(`user:${sessionId}:friends`));

    const newFriendhandler = () => {
      router.refresh();
    };

    const chathandler = (message: EntendedMessage) => {
      const shouldNotify =
        pathname !==
        `/dashboard/chat/${chatHrefContructor(sessionId, message.senderId)}`;
      if (!shouldNotify) return;
      toast.custom((t) => (
        <UnseenToast
          sessionId={sessionId}
          senderId={message.senderId}
          senderImage={message.senderImage}
          senderMessage={message.text}
          senderName={message.senderName}
          t={t}
          key={message.id}
        />
      ));
      setUnseenMsg((prev) => [...prev, message]);
    };

    pusherClient.bind("new_message", chathandler);
    pusherClient.bind("new_friend", newFriendhandler);

    return () => {
      pusherClient.unsubscribe(pusherKey(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(pusherKey(`user:${sessionId}:friends`));
    };
  }, [pathname, sessionId, router]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMsg((prev) => {
        return prev.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);
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
