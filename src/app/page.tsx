import Button from "@/components/Button";
import { redisdb } from "@/libs/db";

export default async function Home() {
  await redisdb.set("hello", "hello");
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button variant={"default"}>Hello </Button>
    </main>
  );
}
