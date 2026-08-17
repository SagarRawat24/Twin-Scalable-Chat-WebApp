import { Router, Request, Response } from 'express'
import { authMiddleware } from "../Middleware/auth.middle.js";
import { db } from "../db/db.js";
import { GroupChat, GroupMembers } from '../db/schema.js';
import { eq } from "drizzle-orm"



export const GroupRouter = Router()
export const GetAllUserListRouter = Router()



// endpoint for the creating a new group
GroupRouter.post("/data", authMiddleware, async (req: Request, res: Response) => {
    try {

        const loginUserId = req.user?.id

        const { createdBy, groupId, groupName, groupList } = req.body


        if (!createdBy) {
            return res.status(400).json({ error: "createdBy var is required" });
        }


        if (loginUserId !== createdBy) {
            return res.status(403).json({ error: "unauthorized: createdBy does not match logged-in user" })
        }



        const newGroup = await db.transaction(async (tx) => {

            const [group] = await tx.insert(GroupChat).values({
                groupName,
                createdBy: loginUserId
            }).returning()


            await tx.insert(GroupMembers).values(
                groupList.map((member: { userId: string }) => ({
                    groupId: group.id,
                    userId: member.userId
                }))
            )

            return group
        })

        return res.status(201).json({
            groupId: newGroup.id,
            groupName: newGroup.groupName,
            createdBy: newGroup.createdBy,
            createdAt: newGroup.createdAt,
            totalUsers: groupList.length,
            groupList: groupList, 
        })


    } catch (err) {
        console.error("Group creation is failed ", err)
        return res.status(500).json({ error: "failed to create group" })
    }
})




// login user ke saare groups lao
GetAllUserListRouter.get('/fetch_user',authMiddleware ,async (req: Request, res: Response) => {

    try {

        const loginuserid = req.user?.id
    

        if(!loginuserid) return res.status(401).json({error:"unauthorized user"})


         // login user jin groups ka member hai, unki GroupMembers rows nikal   
         //ar membership-row ke saath uska poora group data bhi JOIN karke le aao (ek GroupMembers row sirf groupId+userId rakhti hai, poori group details nahi
         //  — isliye relation traverse karna pada).
         //with: { members: { with: { user: true } } } (nested) — aur har group ke andar, uske saare members bhi lao, aur har member ke user details (naam, etc)
         //  bhi — kyunki frontend ko poora member-list chahiye (jaisa tumne ChatUi mein hover-dropdown mein members dikhaya tha, member names ke sath).

        const memberships = await db.query.GroupMembers.findMany({
            where: eq(GroupMembers.userId, loginuserid),
            with: {
                group: {
                    with: { 
                        members: { with: { user: true } },
                    },
                },
            },
        })




       const groups =  memberships.map((m) => ({
            groupId: m.group.id,
            groupName: m.group.groupName,
            createdBy: m.group.createdBy,
            totalUsers: m.group.members.length,
            groupList: m.group.members.map((mem) => ({
                userId: mem.user.id,
                userName: mem.user.name,
            })),
        }))

       

        return res.status(200).json({ groups })
    }catch(err){
        console.error("failed to fetch groups", err)
        return res.status(500).json({error:"failed to fetch group data"})
    }
})
