import { betterAuth } from "better-auth";
import { multiSession } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db.js";

export const auth = betterAuth({
  /* =======================
     🔑 REQUIRED
     OAuth callback base
  ======================= */
  baseURL: process.env.BETTER_AUTH_BACKEND, // http://localhost:8000

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  plugins: [
    multiSession({
      maximumSessions: 5, // allow up to 5 simultaneous sessions
    }),
  ],

  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  rateLimit: {
    window: 10,
    max: 100,
  },

   session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },





  advanced: {
    cookieOptions: {
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
    useSecureCookies: false, // localhost
  },

  /* =======================
     🔐 TRUSTED ORIGINS
  ======================= */
 trustedOrigins: ["http://localhost:3000"],
});



// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { db } from "../db/db.js";

// export const auth = betterAuth({
//   // ✅ HARD-CODE FOR LOCAL DEV
//   baseURL: "http://localhost:8000",

//   database: drizzleAdapter(db, {
//     provider: "pg",
//   }),

//   emailAndPassword: {
//     enabled: true,
//   },

//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     },
//   },

//   session: {
//     expiresIn: 60 * 60 * 24 * 7,
//     updateAge: 60 * 60 * 24,
//   },

//   advanced: {
//     cookieOptions: {
//       sameSite: "lax",
//       httpOnly: true,
//       path: "/",
//     },
//     useSecureCookies: false, // localhost
//   },

//   trustedOrigins: ["http://localhost:3000"],
// });
