import Button from "@/components/Button";
import { getServerSession } from "next-auth";
import { FC } from "react";

const Page = async ({}) => {
  const sesssion = await getServerSession();
  console.log("🚀 ~ file: ~ sesssion:", sesssion);

  return <pre>{JSON.stringify(sesssion)}</pre>;
};

export default Page;
