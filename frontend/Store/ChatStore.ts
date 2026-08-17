import { create } from "zustand"

type User = {
  id: string
  name: string
  image: string
}

type UserChatTypes = {
  userChatList: User[]
  addUser: (user: User) => void
}

export const useChatList = create<UserChatTypes>((set, get) => ({
  
  userChatList: [],   

  addUser: (user) => {
    
    const exists = get().userChatList.find(
      (item) => item.id === user.id
    )

    if (exists) return

    set((state) => ({
      userChatList: [...state.userChatList, user],
       

    
    }))

    
  }

}))