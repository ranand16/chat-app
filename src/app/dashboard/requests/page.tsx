import FriendRequests from "@/components/FriendRequests";
import { fetchRedis } from "@/helpers/redis";
import { authOption } from "@/libs/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

const Page = async ({}) => {
  const session = await getServerSession(authOption);
  if (!session) notFound();
  const icomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${session.user.id}:incoming_friend_requests`
  )) as string[];

  const incomingUserDetails = await Promise.all(
    icomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as strin;
      return {
        senderId,
        senderEmail: sender.email,
      };
    })
  );
  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8"></h1>
      <div className="flex flex-col gap-4 ">
        <FriendRequests
          sessionId={session.user.id}
          incomingUserDetails={incomingUserDetails}
        />
      </div>
    </main>
  );
};

export default Page;
