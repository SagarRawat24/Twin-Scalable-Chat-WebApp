'use client'
import Navbar from "@/component/navbar"
import UsersUI from "@/component/UsersUi"
import ChatUi from "@/component/Chat"
import { useSession } from "@/lib/auth_client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Spinner } from "@/component/spinner"
import AddUserGroup from "@/component/AddUserGroup"
import { useAddUserGroup } from "@/Store/toggle"
import { AnimatePresence } from "framer-motion"



export default function Home() {

  const { data: session, isPending } = useSession()
  const router = useRouter()
  const isvisible = useAddUserGroup((s) => s.isvisible)

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin")
    }
  }, [session, isPending])


  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="text-blue-500 size-12" />
      </div>
    )
  }

  if (!session) return null


  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* Navbar */}
      <Navbar />

      {/* BELOW NAVBAR */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <UsersUI />



        {/* Right chat area */}
        <div className="flex-1  text-white overflow-hidden">
          <ChatUi currentuserId={session.user.id} />
        </div>


        <AnimatePresence>
          {isvisible && <AddUserGroup />}
        </AnimatePresence>

      </div>
    </div>
  )
}
