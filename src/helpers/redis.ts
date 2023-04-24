const upstashRedisURL = process.env.UPSTASH_REDIS_REST_URL;
const authToken = process.env.UPSTASH_REDIS_REST_TOKEN;
type Command = "zrange" | "sismember" | "get" | "smembers";

export async function fetchRedis(
  command: Command,
  ...args: (string | number)[]
) {
  const commandUrl = `${upstashRedisURL}/${command}/${args.join("/")}`;
  const resp = await fetch(commandUrl, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
    cache: "no-store",
  });
  if (!resp.ok) {
    throw new Error(`Error executing Redis command: ${resp.statusText}`);
  }
  const data = await resp.json();
  return data.result;
}
