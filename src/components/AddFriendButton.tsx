"use client";
import { FC, useState } from "react";
import Button from "./Button";
import { addFriendValidator } from "@/libs/validations/addFriend";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface AddFriendButtonProps {}

type FormData = z.infer<typeof addFriendValidator>;

const AddFriendButton: FC<AddFriendButtonProps> = ({}) => {
  const [showSuccessState, setShowSuccessState] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(addFriendValidator),
  });
  const addFriend = async (email: string) => {
    try {
      const validatedemail = addFriendValidator.parse({ email });
      await axios.post("/api/friends/add", {
        email: validatedemail,
      });
      setShowSuccessState(true);
    } catch (e) {
      if (e instanceof z.ZodError) {
        console.log("zod error");
        setError("email", {
          message: e.message,
        });
        return;
      }
      if (e instanceof AxiosError) {
        setError("email", {
          message: e.response?.data,
        });
        return;
      }
      setError("email", {
        message: "Something went wrong!",
      });
      return;
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm">
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        Add friend by E-Mail
      </label>
      <div className="mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 "
          placeholder="you@example.com"
        />
        <Button type="submit">Add</Button>
      </div>
      <p className="mt-1 text-sm text-red-500">{errors.email?.message}</p>
      {showSuccessState && (
        <p className="mt-1 text-sm text-green-500">Friend request sent</p>
      )}
    </form>
  );
};

export default AddFriendButton;
