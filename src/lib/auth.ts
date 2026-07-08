import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { sql } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        const rows = await sql`
          SELECT u.id, u.email, u.password_hash,
                 p.full_name, p.role, p.company_id
          FROM users u
          LEFT JOIN profiles p ON p.id = u.id
          WHERE u.email = ${credentials.email as string}
          LIMIT 1
        `;
        const user = rows[0];
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password as string, user.password_hash as string);
        if (!ok) return null;

        return {
          id: user.id as string,
          email: user.email as string,
          name: (user.full_name as string) ?? null,
          role: (user.role as string) ?? "empresa",
          company_id: (user.company_id as string) ?? null,
        };
      },
    }),
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as Record<string, unknown>).role as string;
        token.company_id = (user as Record<string, unknown>).company_id as string | null;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id         = token.id as string;
      session.user.role       = token.role as string;
      session.user.company_id = (token.company_id ?? null) as string | null;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: { strategy: "jwt" },
});
