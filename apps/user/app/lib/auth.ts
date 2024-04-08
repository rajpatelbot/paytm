import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "text", placeholder: "Enter your phone", required: true },
        password: { label: "Password", type: "password", placeholder: "Enter your password", required: true },
      },
      // TODO: User credentials type from next-auth

      // @ts-ignore
      async authorize(credentials: any) {
        // TODO: Do zod validation, OTP verification here
        const hashedPassword = await bcrypt.hash(credentials.password, 10);
        const existingUser = await db.user.findFirst({
          where: {
            number: credentials.phone,
          },
        });

        if (existingUser) {
          const passwordVarification = await bcrypt.compare(credentials.password, existingUser.password);
          if (passwordVarification) {
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.email,
            };
          }
          return null;
        }

        try {
          const user = await db.user.create({
            data: {
              number: credentials.phone,
              password: hashedPassword,
            },
          });

          return user;
        } catch (error) {
          console.log(error);
        }

        return null;
      },
    }),
  ],

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  secret: process.env.NEXTAUTH_SECRET || "secret",
  callbacks: {
    // TODO: can u fix the type here? Using any is bad
    async session({ token, session }: any) {
      session.user.id = token.sub;
      return session;
    },
  },
};
