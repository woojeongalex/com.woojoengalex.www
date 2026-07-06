import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { Account, NextAuthOptions, Session } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

const googleClientId = process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    'GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET 환경변수가 필요합니다.'
  )
}

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/contacts.readonly',
        },
      },
    }),
  ],
  callbacks: {
    jwt({ token, account }: { token: JWT; account: Account | null }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    session({ session, token }: { session: Session; token: JWT }) {
      session.accessToken = token.accessToken
      return session
    },
  },
}

const handler = NextAuth(authOptions) as (
  req: NextRequest
) => Promise<Response> | Response
export { handler as GET, handler as POST }
