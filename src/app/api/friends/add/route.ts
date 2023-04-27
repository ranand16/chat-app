import { fetchRedis } from "@/helpers/redis";
import { pusherServer } from "@/libs/Pusher";
import { authOption } from "@/libs/auth";
import { redisdb } from "@/libs/db";
import { pusherKey } from "@/libs/utils";
import { addFriendValidator } from "@/libs/validations/addFriend";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = addFriendValidator.parse(body.email);

    const idToAdd = (await fetchRedis("get", `user:email:${email}`)) as string;

    console.log("🚀 ~ file: route.ts:15 ~ POST ~ idToAdd:", idToAdd);
    // const data = (await RESTResponse.json()) as { result: string };
    // const idToAdd = data.result;
    if (!idToAdd)
      return new Response("This person does not exist", { status: 400 });
    const session = await getServerSession(authOption);
    if (!session) return new Response("Unauthorized", { status: 401 });

    if (idToAdd === session.user.id)
      return new Response("You cannot add yourself", { status: 400 });
    const isAlreadyAdded = (await fetchRedis(
      "sismember",
      `user:${idToAdd}:incoming_friend_requests`,
      session.user.id
    )) as 0 | 1;
    if (isAlreadyAdded)
      return new Response("Already added this user", { status: 400 });

    const isAlreadyFriend = (await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    )) as 0 | 1;
    if (isAlreadyFriend)
      return new Response("Already this user's friend", { status: 400 });

    console.log("friendRequestHandler :: ");

    try {
      await pusherServer.trigger(
        pusherKey(`user:${idToAdd}:incoming_friend_requests`),
        "incoming_friend_requests",
        {
          senderId: session.user.id,
          senderEmail: session.user.email,
        }
      );
    } catch (error) {
      console.error("error is ", error);
    }

    redisdb.sadd(`user:${idToAdd}:incoming_friend_requests`, session.user.id);
    return new Response("OK");
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
