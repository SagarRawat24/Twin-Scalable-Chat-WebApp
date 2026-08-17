export type UserList = {

      addedUserId: string
      name: string
      email: string
      image?: string | null
      addedAt: string
}


export interface GroupMember {

      userId: string,
      userName: string
}


export interface GroupList {
      groupId: string
      groupName: string
      createdBy: string
      createdAt: string
      totalUsers: number
      groupList: GroupMember[]
}





export type chatResponse = {
      success: boolean
      data: UserList[]
      error?: string
}


export type Message = {
      id: string,
      body: string | null,
      imageUrl: string | null,
      createdAt: string,
      senderUserId: string,
      receiverUserId: string,
      sender: { id: string, name: string, image: string | null }
      receiver: { id: string, name: string, image: string | null }
}


export interface GroupChatData {
      groupId: string
      groupName: string
      member: {              //  singular — actual backend key yahi hai
            userID: string    // capital ID
            Name: string      //  capital N
            image: string | null
      }[]
      messages: GroupMessage[]
      nextCursor?: string | null
}
 
// ✅ Individual message ka shape — ye already sahi match karta hai backend se
export interface GroupMessage {
      id: string
      groupId: string
      body: string | null
      imageUrl: string | null
      createdAt: string
      sender: {
            id: string
            name: string
            image: string | null
      }
}