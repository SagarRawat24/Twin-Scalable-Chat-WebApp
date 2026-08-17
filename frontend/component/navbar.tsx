'use client'
import Link from "next/link"
import Image from "next/image"
import DarkMode from "./darkmode"
import { authClient } from "@/lib/auth_client";
import { useEffect, useState } from "react";
import { UserRoundPlusIcon } from "./GroupUseraddIcon";
import { useAddUserGroup } from "@/Store/toggle";




type SessionType = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };
};


export default function Navbar() {

  const [session, setSession] = useState<SessionType | null>(null);

  const show = useAddUserGroup((s) => s.show)


  useEffect(() => {
    async function getUser() {
      const image = await authClient.getSession();


      setSession(image.data);

      
    }

    getUser();
  }, []);



  return (
    <div className=" w-full z-50 ">
      <div
        className="

          flex justify-between items-center px-10 py-3
          backdrop-blur-xl
          border-b
          
        "
      > 
        {/* Logo — left side */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={45}
            height={45}
            className="object-contain"
            priority
          />
        </Link>

        {/* right side icons — space-x-3 yahan shift kiya, sirf is group ke andar spacing chahiye */}
        <div className="flex items-center space-x-3">
          <button onClick={show} className=" p-2 rounded-sm hover:bg-zinc-200 dark:hover:bg-white/10 transition-all duration-300">
            <UserRoundPlusIcon size={16} title="Create Group" className="text-black/60  dark:text-white" />
          </button>
          <DarkMode />

          <Link href="/profile">
            <img
              src={session?.user?.image ?? "/user.png"}
              alt={session?.user?.name ?? "Profile picture"}
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full object-cover border cursor-pointer"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}