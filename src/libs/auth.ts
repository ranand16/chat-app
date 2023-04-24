import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { NextAuthOptions } from "next-auth";
import { redisdb } from "./db";

import GoogleProvider from "next-auth/providers/google";
import { fetchRedis } from "@/helpers/redis";

function getGoogleCreds() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || clientId.length === 0) throw new Error("Missing clientid!");
  if (!clientSecret || clientSecret.length === 0)
    throw new Error("Missing clientSecret!");
  return {
    clientId,
    clientSecret,
  };
}

export const authOption: NextAuthOptions = {
  adapter: UpstashRedisAdapter(redisdb),
  providers: [
    GoogleProvider({
      clientId: getGoogleCreds().clientId,
      clientSecret: getGoogleCreds().clientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const dbUserRes = (await fetchRedis("get", `user:${token.id}`)) as
        | string
        | null;
      if (!dbUserRes) {
        token.id = user!.id;
        return token;
      }
      const dbUser = JSON.parse(dbUserRes) as User;
      console.log("🚀 ~ file: auth.ts:39 ~ jwt ~ dbUser:", dbUser);

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
    redirect() {
      return "/dashboard";
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
