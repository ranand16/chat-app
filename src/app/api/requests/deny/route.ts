import { fetchRedis } from "@/helpers/redis";
import { authOption } from "@/libs/auth";
import { redisdb } from "@/libs/db";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const session = await getServerSession(authOption);
    if (!session) return new Response("Unauthorized", { status: 401 });

    const { id: idToDeny } = z
      .object({
        id: z.string(),
      })
      .parse(body);
    await redisdb.srem(
      `user:${session.user.id}:incoming_friend_requests`,
      idToDeny
    );

    return new Response("Denied");
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }
    return new Response("Invalid request", { status: 400 });
  }
}
