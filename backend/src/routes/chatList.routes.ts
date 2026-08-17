    import { Router, Response } from "express";
    import { db } from "../db/db.js";
    import { chatList, user } from "../db/schema.js";
    import { authMiddleware } from "../Middleware/auth.middle.js";
    import { listenClient } from "../listenClient.js";
    import { AuthRequest } from "../Types/express.js";
    import { eq } from "drizzle-orm";



const router = Router()


router.post("/Post", authMiddleware, async (req, res) => {

    try {

            if (!req.user) {
                return res.status(401).json({ error: "Unauthorized" })
            }

        const ownerId = req.user.id;

        const { addedUserId } = req.body

        // validation 

        if (!addedUserId) {
            return res.status(400).json({ error: "addedUserId is required" });
        }

        // ❌ prevent self-add
        if (ownerId === addedUserId) {
            return res.status(400).json({ error: "Cannot add yourself" });
        }


        await db.insert(chatList).values({
            ownerId,
            addedUserId,
        });

        res.json({ success: true });
    } catch (error: any) {

        if (error.code === "23505") {
            return res.status(409).json({ error: "User already added" });
        }

        console.error(error);
        res.status(500).json({ error: "Internal server error" });


    }
})


// routeof ping the user ui when the table its change 
const sseClients = new Map<string, Set<Response>>()


listenClient.on('notification', (msg) => {
    try {

        const payload = JSON.parse(msg.payload ?? '{}') as { owner_id: string }

        const ownerid = payload.owner_id

        if (!ownerid) return

        

        const ownerClients = sseClients.get(ownerid)

        if (ownerClients) {
            for (const client of ownerClients) {
                client.write('data: ping\n\n');
            }
        }

    } catch (err) {
        console.error('notification parse error', err)
    }
})


// user chalist data 

router.get('/get', authMiddleware, async (req: AuthRequest, res: Response) => {

    // Pehle check karo
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const ownerid = req.user.id

    try {

        const contacts = await db.select({
            addedUserId: chatList.addedUserId,
            name: user.name,
            email: user.email,
            image: user.image,
            addedAt: chatList.createdAt,
        }).from(chatList)
            .innerJoin(user, eq(chatList.addedUserId, user.id))
            .where(eq(chatList.ownerId, ownerid))

        res.json({ success: true, data: contacts })

    } catch (err) {
        console.error('fetch the chalist error', err)
        res.status(500).json({ success: false, error: 'failed to fetch the contancts' })
    }
})


// stable connection between browser and server 

router.get('/stream',authMiddleware, (req: AuthRequest, res: Response) => {

    const ownerid = req.user.id

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'Keep-alive')
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.flushHeaders()

   
   // Is owner ka Set nahi hai toh banao
    if (!sseClients.has(ownerid)) {
        sseClients.set(ownerid, new Set())
    }

    sseClients.get(ownerid)!.add(res);



    // Connection zinda rakhne ke liye heartbeat (every 30s)
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 30000);


    // Client disconnect hone par cleanup
  req.on('close', () => {
    const ownerSet = sseClients.get(ownerid);
    if (ownerSet) {
      ownerSet.delete(res);
      if (ownerSet.size === 0) {
        sseClients.delete(ownerid);
      }
    }
    clearInterval(heartbeat);
  });

})



export default router