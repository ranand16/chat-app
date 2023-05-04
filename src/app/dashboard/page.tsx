import { getFriendsByUserId } from "@/helpers/get-friends-by-userid";
import { fetchRedis } from "@/helpers/redis";
import { authOption } from "@/libs/auth";
import { chatHrefContructor } from "@/libs/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const Page = async ({}) => {
  const session = await getServerSession(authOption);
  if (!session) notFound();

  const friends = await getFriendsByUserId(session.user.id);
  console.log("🚀 ~ file: page.tsx:15 ~ Page ~ friends:", friends);
  const friendsWithLastMsg = await Promise.all(
    friends.map(async (friend) => {
      const [lastMsgRaw] = (await fetchRedis(
        "zrange",
        `chat:${chatHrefContructor(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];
      const lastMsg = JSON.parse(lastMsgRaw) as Message;
      return {
        ...friend,
        lastMsg,
      };
    })
  );
  return (
    <div className="container py-12">
      <h1 className="font-bold text-5xl b-8">Recent chats</h1>
      {friendsWithLastMsg.length === 0 ? (
        <p className="text-sm text-zinc-500">Nothing to show here...</p>
      ) : (
        friendsWithLastMsg.map((fwm) => (
          <div
            className="relative bg-zinc-50 border-zinc-200 p-3 rounded-md"
            key={fwm.id}
          >
            <div className="absolute right-4 inset-y-0 flex items-center">
              <ChevronRight className="h-7 w-7 text-zinc-700" />
            </div>
            <Link
              href={`/dashboard/chat/${chatHrefContructor(
                session.user.id,
                fwm.id
              )}`}
              className="relative sm:flex"
            >
              <div className="mb-4 flex-shrink-0 sm:mb-0 sm:mr-4">
                <div className="relative h-6 w-6">
                  <Image
                    referrerPolicy="no-referrer"
                    fill
                    className="rounded-full"
                    alt={`${fwm.name}`}
                    src={fwm.image}
                  />
                </div>
              </div>
              <div>
                <h4 className="h4 text-lg font-semibold"></h4>
                <p className="mt-1 max-w-md">
                  <span className="text-zinc-400">
                    {fwm.lastMsg.senderId === session.user.id ? "You: " : ""}
                  </span>
                  {fwm.lastMsg.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default Page;
