import { Server } from "socket.io";
import { Server as HttpServer } from "http"
import { DirectMessage } from "../modules/chatService.js";
import { GroupMsgPayload } from "../Types/express.js";
import { db } from "../db/db.js";
import { GroupMembers, GroupMesseges } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import { createShardedAdapter } from "@socket.io/redis-adapter";
import { pub, sub } from "../lib/redisclient.js";


let io: Server | null = null

// userId → Set of socketIds (multiple tabs handle karne ke liye)
const onlineUsers = new Map<string, Set<string>>()


function addOnlineUser(userId: string, socketId: string) {
    const existing = onlineUsers.get(userId)

    if (existing) {
        existing.add(socketId)
    } else {
        onlineUsers.set(userId, new Set([socketId]))
    }
}

function removeOnlineUser(userId: string, socketId: string) {

    const existing = onlineUsers.get(userId)

    if (!existing) return

    existing.delete(socketId)

    if (existing.size === 0) {
        onlineUsers.delete(userId)
    }


}


// Returns array of userIds for the frontend store
function getOnlineUserIds(): string[] {
    return Array.from(onlineUsers.keys())
}


export function initSocket(httpserver: HttpServer) {
    if (io) return io

    io = new Server(httpserver, {
        cors: {
            origin: process.env.BETTER_AUTH_URL,
            credentials: true
        },
        adapter: createShardedAdapter(pub,sub,{subscriptionMode: 'dynamic-private',})
    })


    io.on("connection", async (socket) => {  // ye frontend se trigger hoga when user connect 

        // frontend se user id  nikalo 

        const userid = socket.handshake.auth?.userId as string

      
        // validate karo 

        if (!userid || typeof userid !== "string") {
            socket.disconnect(true)
            return
        }


        //user id store in socket 

        socket.data.userId = userid

        // user apne personal rroom join kare 
        socket.join(`user:${userid}`)

        



        try {
            const memberships = await db.query.GroupMembers.findMany({
                where: eq(GroupMembers.userId, userid),
                columns: { groupId: true }
            })
 
            memberships.forEach((m) => {
                socket.join(`group:${m.groupId}`)
            })
 
            
        } catch (err) {
            console.error("failed to join group rooms on connection:", err)
        }





        // Use the helper function
        addOnlineUser(userid, socket.id)

        // add to online map 

        // onlineUsers.set(userid, { userId: userid, socketId: socket.id})


        // broadcast or tell everyone this ever came online

        socket.broadcast.emit('user-connected', { userId:userid, socketId: socket.id })

        // send full list to the newly connected user only

        socket.emit('online-users', getOnlineUserIds().map((uid) => ({
            userId: uid,
            socketId: socket.id
        })))


      



       // group chat  msg receive from frontend 
       
       socket.on('Groupmsg:send' , async(payload: GroupMsgPayload)=>{
         
         


         try {

            const {senderid, groupId, body , imageUrl} = payload 

            // check userid and sernderid is ame 

            if(userid !== senderid){
                socket.emit('group:error', {error: "Unauthorized user  "})

                return 
            }

            if(!groupId || (!body && !imageUrl )){

                socket.emit('group:error', {error: 'Fields can not be empty'})

                return
            }


            // checking is sender is group memeber or not 

            const membership = await db.query.GroupMembers.findFirst({
                where: and(
                    eq(GroupMembers.groupId, groupId), 
                    eq(GroupMembers.userId, userid)
                )
            }) 

            if(!membership){
               socket.emit('group:error',{error: 'not a memeber of this group '})
               return 
            }
          

            // insert the data 


             // insert + return the saved row
            const [inserted] = await db.insert(GroupMesseges).values({
               // schema m vo define kra h propername same hona chahiye 
                groupid: groupId,
                senderId: senderid,
                body,
                imageUrl
            }).returning()

              

            const sender = await db.query.user.findFirst({
                where:(u,{eq}) =>eq(u.id , senderid),
                columns:{name:true}
            }) 
           
            

            const FullGroupMsg ={

                id: inserted.id,
                senderid: inserted.senderId,
                sendername: sender?.name ?? 'unknown',
                groupid: inserted.groupid,
                body: inserted.body,
                imageUrl: inserted.imageUrl,
                createdAt: inserted.createdAt

            }
         
           

            // frontend  ko msg return kr h group ka  rha h show on ui
            io?.to(`group:${groupId}`).emit('Groupmsg:receive', FullGroupMsg)

             
             
            
         } catch (error) {

            console.error('Groupmsg:send error',error)
            socket.emit('group:error',{error:'message did not send'})
            
         }

       })










        //  message recieve from frontend  one to one 

        socket.on("message:send", async (payload: unknown) => {   // message:send ek event ka naam h aur ek convection h likhne ka tum kese bhi likh skte ho like "mesage_send" ye koi socket.io ka special keyword nhi h : colon readability k liye use ho rha h isse ye pta chl rha ki "message send" ho rha h 
             
            try {
                const { receiverUserId, body, imageUrl } = payload as {
                    receiverUserId: string,
                    body?: string,
                    imageUrl?: string
                }

                // basic validation  
              
                if (!receiverUserId) return
                if (!body?.trim() && !imageUrl) return
                if (userid === receiverUserId) return

                // db m save karo 
                
                const message = await DirectMessage({
                    senderUserId: userid,
                    receiverUserId,
                    body: body || null,
                    imageUrl: imageUrl || null
                })

                // sendert and reciever ko dono ko message bhejo 

                io?.to(`user:${userid}`).to(`user:${receiverUserId}`).emit("message:receive", message)

            } catch (err) {
                console.error("message:send error:" , err)
                socket.emit("message:error", { error: " message did not send" })
            }
        })

        socket.on("disconnect", () => {
           
            removeOnlineUser(userid , socket.id)

            if(!onlineUsers.has(userid)){
                socket.broadcast.emit('user-disconnected' , userid)
            }
        })


    })

    return io

}

export function getIo() {
    return io;
}

