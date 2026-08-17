import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}



export interface AuthUser {
    
   id : string,
   email: string,
   name? : string | null
}



export interface GroupMsgPayload {

  groupId: string, 
  senderid: string,
  body?: string | null,
  imageUrl?: string | null,
}


export type GroupDataFetch = {
    
    groupId: string,
    groupName: string,
    members: {
        userid: string,
        name: string,
        profileImage: string | null
    } [],
    messages: GroupUserMessage[]


}



export interface GroupUserMessage {
      
   senderid: string,
   senderName: string,
   senderProfileImage: string | null
   body: string | null,
   imageUrl: string | null,
   createdAt: string
}



export interface AuthRequest extends Request {
  user?: Authuser
}