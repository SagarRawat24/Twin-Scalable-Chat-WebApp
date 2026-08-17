import { Router, Response, Request } from "express";
import { db } from "../db/db.js";
import { GroupMembers, user } from "../db/schema.js";
import { authMiddleware } from "../Middleware/auth.middle.js";




export const AllUserRouter = Router()

// fetching the all users for the create group show on the ui 

AllUserRouter.get("/allUsers", authMiddleware, async (req: Request, res: Response) => {

    try {
        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized" })
        }


        const allUsers = await db.select({
            id: user.id,
            name: user.name,
            image: user?.image
        }).from(user)


        return res.status(200).json({
            success: true,
            data: allUsers
        })
    } catch (error) {
        console.error(error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }





})



