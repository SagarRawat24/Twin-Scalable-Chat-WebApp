import { Request, Response, Router } from "express";
import { ListDirectMessages } from "../modules/chatService.js";
import { auth } from "../lib/auth.js";


const router = Router()


router.get("/messages/:otherUserId", async (req: Request, res: Response) => {

    try {

        // better auth se session lo 
        const session = await auth.api.getSession({
            headers: req.headers as any
        })

        if(!session){
            res.status(401).json({error: "unauthorized user"})
            return
        }

        const currentUserid = session.user.id
        const { otherUserId } = req.params


        if (!currentUserid) {
            res.status(401).json({ error: "Unauthorized userr " })
            return
        }

        // Query params lo
        const limit = req.query.limit ? Number(req.query.limit) : 50;

        // Cursor string se Date object banao
        const cursor = req.query.cursor
            ? new Date(req.query.cursor as string)
            : undefined;

         
            
         const data  =  await ListDirectMessages({
            userId: currentUserid,
            otheruserId: otherUserId,
            limit,
            cursor
         })
         
         res.json(data)


    } catch (err) {
      console.error(err)
      res.status(500).json({error: "something went wrong in server "})
    }
})
export default router 