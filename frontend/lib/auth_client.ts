import { createAuthClient } from "better-auth/react"
import { multiSessionClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:8000",
  fetchOptions: {
    credentials: "include",
  },
  plugins:[
    multiSessionClient(),
  ]
})



export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;