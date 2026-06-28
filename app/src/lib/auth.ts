import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.username === "admin" &&
          credentials?.password === process.env.APP_PASSWORD
        ) {
          return { id: "1", name: "Admin" }
        }
        return null
      },
    }),
  ],

  session: {
    strategy: "jwt" as const,
  },
}

export default NextAuth(authOptions)