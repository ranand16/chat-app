import Button from "@/components/Button";
import { getServerSession } from "next-auth";
import { FC } from "react";

const Page = async ({}) => {
  const sesssion = await getServerSession();
  return <pre>{JSON.stringify(sesssion)}</pre>;
};

export default Page;
