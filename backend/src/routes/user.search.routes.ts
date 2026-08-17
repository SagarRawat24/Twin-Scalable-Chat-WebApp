import { Router } from "express";
import { db } from "../db/db.js";
import { user } from "../db/schema.js"; 
import { ilike } from "drizzle-orm";


const router = Router()

router.get("/search" , async(req,res) => {
    try {

        const search = (req.query.search as string)?.trim()

        if(!search || search.length < 1){
            return res.json([])
        }


        const result = await db
         .select()
         .from(user)
         .where(ilike(user.name, `%${search}%`))
         .limit(10)

         res.json(result)

        
    } catch (error) {
         console.error(error)
         res.status(500).json({message: "server error"})
    }
})

export default router