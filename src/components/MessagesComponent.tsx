"use client";
import { cn } from "@/libs/utils";
import { Message } from "@/libs/validations/message";
import { FC, useRef, useState } from "react";

interface MessagesComponentProps {
  initalMessages: Message[];
  sessionId: string;
}

const MessagesComponent: FC<MessagesComponentProps> = ({
  initalMessages,
  sessionId,
}) => {
  const [messages, setMessages] = useState<Message[]>(initalMessages);
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  return (
    <div className="flex h-full flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrolbar-w-2 scrolling-touch">
      <div ref={scrollDownRef} />
      {messages.map((m, i) => {
        const isCurrUser = m.senderId === sessionId;
        const hasNextMsgFromSameUser =
          messages[i - 1].senderId === messages[i].senderId;
        return (
          <div key={`${m.id}-${m.tiemstamp}`} className="chat-message ">
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
                  className={cn("px-4 py-2 rounded-large inline-block", {
                    "bg-indigo-600 text-white ": isCurrUser,
                    "bg-gray-200 text-gray-900": !isCurrUser,
                    "rounded-br-none ": !hasNextMsgFromSameUser && isCurrUser,
                    "rounded-bl-none": !hasNextMsgFromSameUser && !isCurrUser,
                  })}
                >
                  {m.text}{" "}
                  <span className="ml-2 text-xs text-gray-400 ">
                    {m.tiemstamp}
                  </span>
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesComponent;
