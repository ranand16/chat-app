import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";
import { NextAuthOptions } from "next-auth";
import { redisdb } from "./db";

import GoogleProvider from "next-auth/providers/google";

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
      const dbUser = (await redisdb.get(`user:${token["id"]}`)) as User | null;
      if (!dbUser) {
        token.id = user!.id;
        return token;
      }
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
