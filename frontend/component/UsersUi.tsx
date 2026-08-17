"use client"

import { PlusIcon } from "./plus"
import { useSidebar } from "@/Store/toggle"
import UsersSide from "./sidebar"
import { useUsersList } from "@/hooks/useUserList"
import type { UserList, GroupList } from "@/types/chalist"
import { useSelectedUser } from "@/Store/chatbox"
import { useOnlineUserStore } from "@/Store/onlineusers"

export default function UsersUI() {

  const toggle = useSidebar((state) => state.toggle)
  const {
    users: contacts = [],
    groups = [],
    isLoading,
    isError,
  } = useUsersList()

  const setSelecteduser = useSelectedUser((state) => state.setSelectedUserfn)
  const setSelectedgroup = useSelectedUser((state) => state.setSelectedGroupfn)
  
  const isUserOnline = useOnlineUserStore((s) => s.isUserOnline)

  const handleSelectUser = (user: UserList) => {
    setSelecteduser(user)
  }

  const handleSelectGroup = (group: GroupList) => {
    setSelectedgroup(group)
  }

  if (isError) {
    return <p>Error loading chats.</p>
  }

  const hasNoData = contacts.length === 0 && groups.length === 0

  //  Skeleton UI 
  if (isLoading && hasNoData) {
    return (
      <div className="relative min-w-87 border dark:border-white/10 border-gray-200 h-full overflow-y-auto ml-5 rounded-md">
        <div className="flex items-center h-20 w-full border border-gray-200 dark:border-white/10">
          <div className="mx-3 flex justify-between mt-2 h-fit w-full">
            <div className="h-8 w-20 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
            <div className="rounded-full h-10 w-10 border border-gray-200 dark:border-white/20 bg-gray-200 dark:bg-white/10 animate-pulse" />
          </div>
        </div>

        <div className="h-auto p-2 w-full space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-md">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse shrink-0" />
              <div className="h-4 w-36 rounded bg-gray-200 dark:bg-white/10 animate-pulse ml-2" />
              <div className="ml-auto min-w-[18px] h-[18px] rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  //  Real UI 
  return (
    <div className="relative min-w-87 border dark:border-white/10 border-gray-200 h-full overflow-y-auto ml-5 rounded-md">

      <div data-no-skeleton>
        <UsersSide />
      </div>

      <div className="flex items-center h-20 w-full border">
        <div className="mx-3 flex justify-between mt-2 h-fit w-full">
          <span className="font-bold text-2xl">Chats</span>
          <button
            onClick={toggle}
            className="rounded-full h-10 w-10 border border-black/20
            shadow-[0_3px_10px_rgb(0,0,0,0.2)]
            dark:border-white/20 flex items-center justify-center
            transition-transform duration-300 active:scale-95"
          >
            <PlusIcon size={20} />
          </button>
        </div>
      </div>

      <div className="h-auto p-2 w-full space-y-2">
        {hasNoData ? (
          <p className="text-lg mt-8 font-medium text-center text-gray-600">
            No chats yet
          </p>
        ) : (
          <> 
            {/*  Users section */}
            {contacts.length > 0 && (
              <>
                {contacts.map((user) => (
                  <div
                    key={user.addedUserId}
                    className="flex items-center gap-3 p-3 rounded-md cursor-pointer
                    hover:bg-gray-200 dark:hover:bg-white/10 transition"
                  >
                    <div onClick={() => handleSelectUser(user)} className="flex gap-2 w-full items-center">
                      <div className="relative w-10 h-10 flex-shrink-0">
                        <img
                          src={user.image ?? "/user.png"}
                          alt={user.name ?? 'user'}
                          className="w-10 h-10 rounded-full object-cover"
                        />

                        {isUserOnline(user.addedUserId) && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full shadow-[0_0_6px_2px_rgba(34,197,94,0.6)]" />
                        )}

                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 dark:border-[#1a1a1a]
                        ${isUserOnline(user.addedUserId) ? 'bg-green-500' : 'bg-red-400'}`}
                        />
                      </div>
                      <span className="font-medium text-base ml-2">
                        {user.name ?? 'Unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
            {/* ── Groups section ─────────────────────── */}
            {groups.length > 0 && (
              <>
                {groups.map((group) => (
                  <div
                    key={group.groupId}
                    onClick={() => handleSelectGroup(group)}
                    className="flex items-center gap-3 p-3 rounded-md cursor-pointer
                    hover:bg-gray-200 dark:hover:bg-white/10 transition"
                  >
                    <img
                          src={"/group.png" }
                          className="w-10 h-10 rounded-full object-cover"
                        />
                    <div className="flex flex-col">
                      <span className="font-medium text-base">
                        {group.groupName}
                      </span>
                      <span className="text-xs text-gray-400">
                        {group.totalUsers} members
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}

            
          </>
        )}
      </div>
    </div>
  )
}