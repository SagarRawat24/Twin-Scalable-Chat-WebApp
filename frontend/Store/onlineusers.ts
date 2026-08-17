import {create} from 'zustand'

interface onlineusers {
    userId : string
    socketId: string

}


interface OnlineUserStore {
  
     Onlineusers: Map<string, onlineusers>
     setOnlineUser: (users: onlineusers[]) => void
     addOnlineUser: (users: onlineusers) => void
     removeOnlineUser: (userId: string) => void
     isUserOnline: (userId: string) => boolean

}


export const useOnlineUserStore = create<OnlineUserStore>((set,get)=>({
    Onlineusers: new Map(),
    setOnlineUser: (users) => 
        set({
            Onlineusers: new Map(users.map((u) => [u.userId , u])),

        }),
    addOnlineUser: (users) =>
        set((state) => {
            const updated = new Map (state.Onlineusers)
            updated.set(users.userId, users)
            return {Onlineusers: updated} 
        }),

     removeOnlineUser: (userId) =>
        set((state) => {
            const updated = new Map (state.Onlineusers)
            updated.delete(userId)
            return {Onlineusers: updated} 
        }),   


        isUserOnline:(userId) => get().Onlineusers.has(userId)


})) 