"use client";
import { cn } from "@/libs/utils";
import { Message } from "@/libs/validations/message";
import { format } from "date-fns";
import Image from "next/image";
import { FC, useRef, useState } from "react";

interface MessagesComponentProps {
  initalMessages: Message[];
  sessionId: string;
  sessionImg: string | null | undefined;
  chatPartner: User;
}

const MessagesComponent: FC<MessagesComponentProps> = ({
  initalMessages,
  sessionId,
  chatPartner,
  sessionImg,
}) => {
  const [messages, setMessages] = useState<Message[]>(initalMessages);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);

  const formatTImestamp = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };
  return (
    <div className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrolbar-w-2 scrolling-touch">
      <div ref={scrollDownRef} />
      {messages.map((m, i) => {
        const isCurrUser = m.senderId === sessionId;
        const hasNextMsgFromSameUser =
          messages[i - 1]?.senderId === messages[i].senderId;
        return (
          <div key={`${m.id}-${m.timestamp}`} className="chat-message ">
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrUser,
                    "order-2 items-start": !isCurrUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white ": isCurrUser,
                    "bg-gray-200 text-gray-900": !isCurrUser,
                    "rounded-br-none ": !hasNextMsgFromSameUser && isCurrUser,
                    "rounded-bl-none": !hasNextMsgFromSameUser && !isCurrUser,
                  })}
                >
                  {m.text}{" "}
                  <span className="ml-2 text-xs text-gray-400 ">
                    {formatTImestamp(m.timestamp)}
                  </span>
                </span>
              </div>
              <div
                className={cn("relative w-6 h-6 ", {
                  "order-2": isCurrUser,
                  "order-1": !isCurrUser,
                  "invisible ": hasNextMsgFromSameUser,
                })}
              >
                <Image
                  fill
                  src={isCurrUser ? (sessionImg as string) : chatPartner.image}
                  alt={""}
                  referrerPolicy="no-referrer"
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesComponent;
