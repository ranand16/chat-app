import { fetchRedis } from "@/helpers/redis";
import { pusherServer } from "@/libs/Pusher";
import { authOption } from "@/libs/auth";
import { redisdb } from "@/libs/db";
import { pusherKey } from "@/libs/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id: idToAdd } = z
      .object({
        id: z.string(),
      })
      .parse(body);
    const session = await getServerSession(authOption);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const isAlreadyFriends = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    );

    if (isAlreadyFriends)
      return new Response("Already friends!", { status: 401 });

    const hasFriendReq = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );
    if (!hasFriendReq)
      return new Response("No frined request", { status: 400 });

    pusherServer.trigger(
      pusherKey(`user:${idToAdd}:friends`),
      "new_friend",
      {}
    );
    await redisdb.sadd(`user:${session.user.id}:friends`, idToAdd);
    await redisdb.sadd(`user:${idToAdd}:friends`, session.user.id);
    await redisdb.srem(
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );

    return new Response("Accepted");
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
