import Button from "@/components/Button";
import { redisdb } from "@/libs/db";

export default async function Home() {
  await redisdb.set("hello", "hello");
  return <>Loading...</>;
}
