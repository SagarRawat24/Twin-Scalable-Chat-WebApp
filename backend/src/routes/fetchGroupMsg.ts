import { Router } from "express";
import { ListGroupMesseges } from "../modules/chatService.js";
import { authMiddleware } from "../Middleware/auth.middle.js";

export const GroupMessagesRoute = Router()


// route for get the messages of a particular group 

 GroupMessagesRoute.get('/messages/:groupid',authMiddleware ,async(req,res)=>{
     try {
        
        const userId:any= req.user?.id 

        if(!userId){
           return res.status(401).json({error: 'unauthorized user'})
        } 


        const {groupid} = req.params

        const {cursor,limit} =req.query

        const result = await ListGroupMesseges({
            groupId: groupid,
            userId,
            cursor: cursor ? new Date(cursor as string):undefined,
            limit: limit ? Number(limit): undefined,
        })

        return res.status(200).json(result)

        
     } catch (err:any) {
        console.error(err)
         return  res.status(500).json({error: 'something went wrong in Groups'})
     }
})

