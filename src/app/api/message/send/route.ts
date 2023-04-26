import { fetchRedis } from "@/helpers/redis";
import { authOption } from "@/libs/auth";
import { redisdb } from "@/libs/db";
import { Message, messageValidator } from "@/libs/validations/message";
import { nanoid } from "nanoid";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } =
      await request.json();
    //validations
    const session = await getServerSession(authOption);
    if (!session) return new Response("Unauthorized", { status: 400 });
    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2)
      return new Response("Unauthorized", { status: 401 });

    const friendId = session.user.id === userId1 ? userId2 : userId1;

    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friends`
    )) as string[];
    const isFriend = friendList.includes(friendId);
    if (!isFriend) return new Response("Unauthorized", { status: 401 });

    const senderInfo = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;
    const parseSenderInfo = JSON.parse(senderInfo) as User;
    const timestamp = Date.now();
    const messageData: Message = {
      text: text,
      id: nanoid() as string,
      senderId: session.user.id,
      timestamp: timestamp,
    };
    const message = messageValidator.parse(messageData);
    // sending
    await redisdb.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });
    return new Response("Message sent");
  } catch (error) {
    if (error instanceof Error)
      return new Response("Internal server error", { status: 500 });
  }
}
