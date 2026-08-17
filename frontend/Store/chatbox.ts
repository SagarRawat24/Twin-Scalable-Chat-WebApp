import {create} from 'zustand'
import type { UserList, GroupList } from '@/types/chalist'



export type selectedChat = 
         | {type: "user"; data: UserList}
         | {type: "group"; data: GroupList}


type selectedUserstate ={
  
     selectedChat : selectedChat | null
     setSelectedUserfn: (user: UserList) => void
     setSelectedGroupfn: (user: GroupList) => void
     clearSelectfn: () => void
     
}


export const useSelectedUser = create<selectedUserstate>((set)=>({
    selectedChat: null,

    setSelectedUserfn: (user) => set({selectedChat: {type: "user", data: user} }),
    
    setSelectedGroupfn: (group) => set({selectedChat: {type: "group", data: group} }),

    clearSelectfn: () => set({ selectedChat: null }),

    

}))
