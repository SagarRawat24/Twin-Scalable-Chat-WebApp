 
// the main purpose of this file is to hold the session data that come from cookie from backend that hold 
// session data and show in the frontend like email , username 
export type AppSession = {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  expiresAt: string
}