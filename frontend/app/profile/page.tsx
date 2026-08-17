/* eslint-disable @next/next/no-img-element */
'use client'

import { authClient } from "@/lib/auth_client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "boneyard-js/react";


import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/component/dialog"
import { Button } from "@/component/button";

type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};




export default function Profile() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      const isBoneyardBuild =
        typeof window !== "undefined" &&
        ("__BONEYARD_BUILD" in window) &&
        (window.__BONEYARD_BUILD === true);

      if (isBoneyardBuild) {
        setSession({
          user: {
            id: "build",
            name: "Alex Smith",
            email: "alex@example.com",
            image: "/user.png",
          },
        });
        setLoading(false);
        return;
      }

      const result = await authClient.getSession();
      console.log("SESSION RESULT:", result);

      if (!result.data) {
        router.push("/signin");

        return;
      }





      setSession(result.data as Session);
      setLoading(false);
    }

    loadSession();
  }, [router]);

  return (
    <Skeleton
      name="profile-page"
      loading={loading}
      className="font-geist"
      fixture={
        <div className="font-geist">
          <div className="flex justify-center items-center min-h-screen">
            <div className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:bg-[#141414] rounded-md w-full max-w-xl">
              <div className="mt-5 flex justify-center">
                <div className="h-28 w-28 rounded-full bg-black/10 dark:bg-white/10 border" />
              </div>

              <h1 className="text-center mt-4">Active</h1>

              <div className="mt-10 font-semibold w-fit ml-10">
                <h1 className="text-lg text-blue-600">Username</h1>
                <div className="mt-2 h-6 w-48 rounded bg-black/10 dark:bg-white/10" />

                <h1 className="mt-10 text-lg text-blue-600">Email</h1>
                <div className="mt-2 h-6 w-64 rounded bg-black/10 dark:bg-white/10" />
              </div>

              <div className="w-5/6 p-3 my-10 mx-10 rounded-md bg-black/10 dark:bg-white/10" />
            </div>
          </div>
        </div>
      }
      fallback={
        <div className="font-geist">
          <div className="flex justify-center items-center min-h-screen">
            <div className="shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:bg-[#141414] rounded-md w-full max-w-xl">
              <div className="mt-5 flex justify-center">
                <div className="h-28 w-28 rounded-full bg-black/10 dark:bg-white/10 border" />
              </div>
              <div className="mt-10 font-semibold w-fit ml-10">
                <div className="h-6 w-48 rounded bg-black/10 dark:bg-white/10" />
                <div className="mt-10 h-6 w-64 rounded bg-black/10 dark:bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="font-geist">
        <div className="flex justify-center items-center min-h-screen">
          <div className="shadow-[0_8px_30px_rgb(0,0,0,0.12)]  dark:bg-[#141414] rounded-md w-full max-w-xl">

            <div className="mt-5 flex justify-center">
              <img
                src={session?.user?.image ?? "/user.png"}
                alt={session?.user?.name ?? "Profile picture"}
                referrerPolicy="no-referrer"
                className="h-28 w-28 rounded-full object-cover border"
              />
            </div>

            <h1 className="text-center mt-4">Active</h1>

            <div className="mt-10  font-semibold  w-fit ml-10">
              <h1 className="text-lg text-blue-600">Username</h1>

              <span className=" text-xl text-black dark:text-white"> {session?.user?.name}</span>

              <h1 className="mt-10 text-lg text-blue-600">Email</h1>

              <span className="text-black text-xl dark:text-white"> {session?.user?.email}</span>
            </div>


          {/* <button
              onClick={async () => {
                await authClient.signOut();
                router.push("/signin");
              }}
              className=" w- my-10 mx-10    py-3 transition-all duration-300 active:scale-95 cursor-pointer
               text-lg py-2 w- rounded-md font-semibold bg-blue-700 text-white"
            >
              Logout
            </button> */}



          <Dialog >
            <DialogTrigger className="w-5/6  p-3 my-10 mx-10 rounded-md bg-blue-700 cursor-pointer text-lg font-semibold ">Logout</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-center">Are you absolutely sure?</DialogTitle>

                <DialogFooter className="mx-auto space-x-2">

                  <DialogClose> 
                    <Button variant="outline" size="lg" className="mt-8  transition-all duration-300 active:scale-95 font-semibold "> Close </Button>
                    
                  </DialogClose>
                 
                <Button  size="lg" 
                  onClick={async () => {
                    await authClient.signOut();
                    router.push("/signin");
                  }}
                  className="mt-8   text-sm  bg-red-500 text-white hover:bg-red-600 transition-all duration-300 active:scale-95 font-semibold">
                  Logout </Button>

                  </DialogFooter>

              </DialogHeader>
            </DialogContent>
          </Dialog>





          </div>
        </div>
      </div>
    </Skeleton>
  );
}