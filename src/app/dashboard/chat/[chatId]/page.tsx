import ChatInput from "@/components/ChatInput";
import MessagesComponent from "@/components/MessagesComponent";
import { fetchRedis } from "@/helpers/redis";
import { authOption } from "@/libs/auth";
import { redisdb } from "@/libs/db";
import { messageArrayValidator } from "@/libs/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FC } from "react";

interface PageProps {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const result: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );
    const dbMessages = result.map((m) => JSON.parse(m) as Message);
    const reversedDbMessages = dbMessages.reverse();

    const messages = messageArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

const Page = async ({ params }: PageProps) => {
  const { chatId } = params;
  console.log("🚀 ~ file: page.tsx:12 ~ chatId:", chatId);
  const session = await getServerSession(authOption);
  if (!session) notFound();

  const { user } = session;

  const [userId1, userId2] = chatId.split("--");

  console.log("🚀 ~ file: page.tsx:50 ~ Page ~ user.id:", user.id);

  if (user.id != userId1 && user.id != userId2) {
    notFound();
  }
  const partnerId = user.id === userId1 ? userId1 : userId2;

  const partner = (await redisdb.get(`user:${partnerId}`)) as User;
  const initalMessages = await getChatMessages(chatId);

  return (
    <div className="flex flex-col flex-1 justify-between h-full max-h[calc(100h-6rem)]">
      <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
        <div className="relative flex items-center space-x-4 ">
          <div className="relative">
            <div className="relative w-8 sm:w-12 h-8 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                src={partner.image}
                alt={`${partner.name} profile picture`}
                className="rounded-full"
              />
            </div>
          </div>
          <div className="flex flex-col leading-tight">
            <div className="flex text-xl items-center">
              <span className="text-gray-700 mr-3 font-semibold">
                {partner.name}
              </span>
            </div>
            <span className="text-sm sm:text-gray-600">{partner.email}</span>
          </div>
        </div>
      </div>
      <MessagesComponent
        initalMessages={initalMessages}
        sessionId={session.user.id}
      />
      <ChatInput chatPartner={partner} chatId={chatId} />
    </div>
  );
};

export default Page;
