"use client"

import { ArrowLeftIcon } from "./arrow-left"
import { useSidebar } from "@/Store/toggle"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/Usededounce"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Skeleton } from "boneyard-js/react"
import { Plus } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

export default function UsersSide() {

  const isOpen = useSidebar((state) => state.isOpen)
  const back = useSidebar((state) => state.toggle)
  const [search, setsearch] = useState("")


  // handle adding to the state var 

 
  const queryClient = useQueryClient()

  const AddintoList = async (user: { id: string; name: string; image?: string | null }) => {
    try {
      // userid send kr rha hu m yha pe 
     
       
      await axios.post("http://localhost:8000/api/v1/users/Post",  { addedUserId: user.id }, { withCredentials: true })

      

         await queryClient.invalidateQueries({ queryKey: ['chat-list'] })
      toast.success(`${user.name} is successfully added`)

      back()


    } catch (error) {

      console.error(error)

      toast.error("failed to add user")

    };
  }


  // debounce val

  const debouncevalue = useDebounce(search, 700)


  // usequery implementation 
  const { data: users, isLoading, isSuccess, isError } = useQuery({

    queryKey: ["users", debouncevalue],
    queryFn: async ({ signal }) => {
      const response = await axios.get("http://localhost:8000/api/v1/users/search",
        {
          params: { search: debouncevalue },
          signal,
        }

      )
      return response.data

    },
    enabled: debouncevalue.length > 1,
    staleTime: 1000 * 60 * 5,





  })

 








  return (
    <div
      className={`
        absolute  top-0 h-full  w-full 
        border border-black/20 bg-white dark:border-white/10 z-50 dark:bg-[#0A0A0A]
        transition-transform duration-300
       ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="flex justify-between  mt-4">
        <button
          onClick={back}
          className="rounded-full p-1 border  border-black/20 dark:border-white/20 
          transition-transform duration-300 active:scale-95 
          shadow-[0_3px_10px_rgb(0,0,0,0.2)]"
        >
          <ArrowLeftIcon size={14} className="p-2" />

        </button>

        {/* serach bar  */}

        <div className="relative w-full ml-1 mr-3 rounded-md h-full">

          <Search size={20} className="absolute left-2 top-1/2 -translate-y-1/2 text-black/80 dark:text-gray-400 opacity-50" />

          <input type="text" placeholder="Search User"
            value={search} onChange={(e) => setsearch(e.target.value)}

            className=" rounded-md w-full py-2 px-9  text-sm
            border-2 border-black/40 dark:border-white/10
            focus:border-blue-500
            focus:outline-none"/>



          








        </div>



      </div>
      <div className="relative  max-w-full pt-6 px-4   mt-2 ">

        <Skeleton
          name="user-search-results"
          loading={isLoading}
          fixture={
            <ul className="space-y-2 w-full">
              {Array.from({ length: 5 }).map((_, i) => (
                <li
                  key={i}
                  className="flex justify-between w-full p-3 rounded-md"
                >
                  <div className="flex space-x-6">
                    <div className="size-10 rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="mt-2 h-5 w-28 rounded bg-black/10 dark:bg-white/10" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-black/10 dark:bg-white/10" />
                </li>
              ))}
            </ul>
          }
          fallback={
            <ul className="space-y-2 w-full">
              {Array.from({ length: 5 }).map((_, i) => (
                <li
                  key={i}
                  className="flex justify-between w-full p-3 rounded-md"
                >
                  <div className="flex space-x-6">
                    <div className="size-10 rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="mt-2 h-5 w-28 rounded bg-black/10 dark:bg-white/10" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-black/10 dark:bg-white/10" />
                </li>
              ))}
            </ul>
          }
        >
          <div>

        {isError && (
          <div className="mx-auto text-center  font-medium text-lg text-red-400">
            Something went wrong
          </div>
        )}

        {isSuccess && users?.length === 0 && (
          <div className="mt-4 text-center font-medium text-base text-gray-500">
            No user Found with {search} Name
          </div>
        )}

        {users?.length > 0 && (
          <ul className="  space-y-2 w-full">
            {users.map((user: { id: string; name: string; image?: string | null }) => (
              <li key={user.id} className="flex justify-between w-full p-3 w-full rounded-md  hover:bg-black/10  dark:hover:bg-white/10">
                <div className="flex  space-x-6">
                  <img
                    src={user.image || "/user.png"}
                    alt={user.name}
                    className="size-10 rounded-full object-cover"
                  />
                  <span className="mt-2 font-medium  text-lg ">{user.name}</span>
                </div>

                <button
                  onClick={() => AddintoList(user)}
                  className="p-3 border transition-transform duration-300 active:scale-95  hover:bg-blue-500   dark:hover:bg-blue-600  rounded-full">
                  <Plus size={16} />
                </button>

              </li>
            ))}
          </ul>
        )}

          </div>
        </Skeleton>
      </div>
    </div>
  )
}
