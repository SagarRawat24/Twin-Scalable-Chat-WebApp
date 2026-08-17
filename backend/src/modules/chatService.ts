
import { error } from "better-auth/api";
import { db } from "../db/db.js";
import { GroupChat, GroupMembers, GroupMesseges, UserMessages } from "../db/schema.js";
import { user } from "../db/schema.js";
import { eq, or, and, asc, lt } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";




export async function ListDirectMessages(params: {
    userId: string
    otheruserId: string
    limit?: number
    cursor?: Date
}) {

    const { userId, otheruserId, cursor } = params
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200)

    const sender = alias(user, "sender")
    const receiver = alias(user, "receiver")

    const conversationFilter = or(
        and(
            eq(UserMessages.senderUserId, userId),
            eq(UserMessages.receiverUserId, otheruserId)
        ),
        and(
            eq(UserMessages.senderUserId, otheruserId),
            eq(UserMessages.receiverUserId, userId)
        )
    )

    // load more msg wala feature 
    const cursorFilter = cursor
        ? lt(UserMessages.createdAt, cursor)
        : undefined


    const whereclause = cursorFilter
        ? and(conversationFilter, cursorFilter)
        : conversationFilter


    // db query 

    const result = await db.select({
        id: UserMessages.id,
        body: UserMessages.body,
        imageUrl: UserMessages.imageUrl,
        createdAt: UserMessages.createdAt,
        senderUserId: UserMessages.senderUserId,
        receiverUserId: UserMessages.receiverUserId,
        sender: {
            id: sender.id,
            name: sender.name,       // adjust to your actual user columns
            imageUrl: sender.image,   // adjust to your actual user columns
        },
        receiver: {
            id: receiver.id,
            name: receiver.name,     // adjust to your actual user columns
            imageUrl: receiver.image, // adjust to your actual user columns
        },

    })
        .from(UserMessages)
        .innerJoin(sender, eq(UserMessages.senderUserId, sender.id))
        .innerJoin(receiver, eq(UserMessages.receiverUserId, receiver.id))
        .where(whereclause)
        .orderBy(asc(UserMessages.createdAt))
        .limit(limit + 1);

    // for pigination  
    const hasMore = result.length > limit;
    const messages = hasMore ? result.slice(0, limit) : result;
    const nextCursor = hasMore ? messages[0]?.createdAt : undefined;


    return {messages , nextCursor }

}



export async function DirectMessage(params: {
  senderUserId: string;
  receiverUserId: string;
  body?: string | null;
  imageUrl?: string | null;
}) {
  const { senderUserId, receiverUserId } = params;
  const trimmedbody = params.body?.trim() || null;
  const imageurl = params.imageUrl ?? null;

  if (!trimmedbody && !imageurl) {
    throw new Error("Message body or image is required");
  }

  // Step 1 — Insert karo
  const [inserted] = await db
    .insert(UserMessages)
    .values({
      senderUserId,
      receiverUserId,
      body: trimmedbody,
      imageUrl: imageurl,
    })
    .returning();

  // Step 2 — Sender aur receiver ke saath fetch karo
  const senderAlias = alias(user, "sender");
  const receiverAlias = alias(user, "receiver");

  const [fullMessage] = await db
    .select({
      id: UserMessages.id,
      body: UserMessages.body,
      imageUrl: UserMessages.imageUrl,
      createdAt: UserMessages.createdAt,
      senderUserId: UserMessages.senderUserId,
      receiverUserId: UserMessages.receiverUserId,
      sender: {
        id: senderAlias.id,
        name: senderAlias.name,
        image: senderAlias.image,
      },
      receiver: {
        id: receiverAlias.id,
        name: receiverAlias.name,
        image: receiverAlias.image,
      },
    })
    .from(UserMessages)
    .innerJoin(senderAlias, eq(UserMessages.senderUserId, senderAlias.id))
    .innerJoin(receiverAlias, eq(UserMessages.receiverUserId, receiverAlias.id))
    .where(eq(UserMessages.id, inserted.id))
    .limit(1);

  return fullMessage; // ✅ sender + receiver ke saath
}






export async function  ListGroupMesseges(params: {groupId: string, userId:string, limit?:number , cursor?: Date}){
  
    
   const { groupId , userId , cursor } = params
   const limit = Math.min(Math.max(params.limit ?? 50 , 1), 200)

   // -- validation -- 

   //findfirst means "Jo pehli row meri condition ko match kare, woh mujhe return kar do.

   const membership =await db.query.GroupMembers.findFirst({
    where:and(
      eq(GroupMembers.groupId,groupId),
      eq(GroupMembers.userId,userId)
    )
   })

   if(!membership){
    throw new Error("you are not member of this Group")
   }

  // groupid and name find krna h Groupchat table se 
  const groupinfo  =await db.query.GroupChat.findFirst({
    where: eq(GroupChat.id , groupId),
    columns: {id:true,groupName:true}   // that means we only want id and groupname its comes from the this columns
  })


  if(!groupinfo){
    throw new Error('Group info is not exist')
  }



  // -- sare members nikal nikal lo 


  const member = await db.select({
     userID: user.id,
     Name: user.name,
     image: user.image,

  }).from(GroupMembers)
  .innerJoin(user,eq(GroupMembers.userId,user.id))
  .where(eq(GroupMembers.groupId,groupId))



  // step 4 


  const SenderAlias = alias(user,"sender")


  const cursorFilter = cursor 
  ? lt(GroupMesseges.createdAt , cursor)
  : undefined

  
  // means get the older message of a particular group less then specific time if cursorFilter is not undefined if undefined get the whole mesage of particular group 
  const whereclause = cursorFilter
  ? and(eq(GroupMesseges.groupid , groupId),cursorFilter)
  : eq(GroupMesseges.groupid, groupId)


  //get the data 


  const result = await db.select({
     id: GroupMesseges.id,
     body: GroupMesseges.body,
     imageUrl: GroupMesseges.imageUrl,
     createdAt: GroupMesseges.createdAt,
     groupId: GroupMesseges.groupid,
     sender: {
       id: SenderAlias.id,
       name: SenderAlias.name,
       image: SenderAlias.image
     },
    })
     .from(GroupMesseges)
     .innerJoin(SenderAlias,eq(GroupMesseges.senderId, SenderAlias.id))
     .where(whereclause)
     .orderBy(asc(GroupMesseges.createdAt))
     .limit(limit + 1)


  
  
  // agar humne limit+1 maanga tha aur utne hi (ya usse zyada) wapas aaye, matlab extra row mil gaya, iska matlab aur bhi messages bache hain database mein.   
  const hasMore = result.length > limit 
  
  // us extra row ko hata diya (wo sirf existence-check ke liye tha, actual data mein nahi bhejna) — asli limit jitne hi messages client ko bheje.
  const messages = hasMore
  ? result.slice(0,limit)
  : result
 

// agla page fetch karne ke liye client ko batana "agli baar is timestamp se pehle wale maango."
  const nextCursor = hasMore
    ? messages[0]?.createdAt
    : undefined

  

    return {
        groupId: groupinfo.id,
        groupName: groupinfo.groupName,
        member,
        messages,
        nextCursor,
    } 



}
