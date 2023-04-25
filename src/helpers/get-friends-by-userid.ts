import { fetchRedis } from "./redis";

export const getFriendsByUserId = async (userId: string) => {
  const friendIds = (await fetchRedis(
    "smembers",
    `user:${userId}:friends`
  )) as string[];
  const friends = await Promise.all(
    friendIds.map(async (fId) => {
      const friend = (await fetchRedis("get", `user:${fId}`)) as string;
      return JSON.parse(friend) as User;
    })
  );
  return friends;
};
