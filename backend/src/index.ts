import express from 'express';
import cors from 'cors'
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import * as dotenv from 'dotenv';
import cookieParser from "cookie-parser"
import userSearch from "./routes/user.search.routes.js"
import Chatlist from "./routes/chatList.routes.js"
import { initlistenClient } from './listenClient.js';
import { createServer } from 'http'
import { initSocket } from './socket/socket.js';
import chatRouter from "./routes/fetchmessages.js"
import { uploadRouter } from './routes/uploadimage.js';
import {  AllUserRouter }from './routes/AllUserGroup.js'
import { GroupRouter , GetAllUserListRouter  } from './routes/Groupdata.js';
import { GroupMessagesRoute } from './routes/fetchGroupMsg.js'; 

dotenv.config();

const app = express();
const httpServer = createServer(app)
const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

/* =======================
   CORS (REQUIRED FOR AUTH)
======================= */

app.use(cookieParser())


app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true, // 🔑 allow cookies
  })
);


app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Better Auth API',
    version: '1.0.0'
  });
});



/* =======================
   BETTER AUTH ROUTES
   MUST BE BEFORE JSON
======================= */
app.use("/api/auth", toNodeHandler(auth));


/* =======================
   BODY PARSERS
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   PROTECTED ROUTE EXAMPLE
======================= */
app.get('/api/protected', async (req, res) => {
  const session = await auth.api.getSession({
    headers: req.headers as any,
  });

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    message: 'You are logged in',
    user: session.user,
  });
});

/* =======================
  user search api 
======================= */

app.use("/api/v1/users", userSearch)


// user add 
app.use("/api/v1/users", Chatlist)


// chat routes adding 

app.use("/api/v1/chat" , chatRouter)  // listmessage wala one tot one message 


// upload image or message image cloudinary

app.use("/api/v1/message",uploadRouter)

// get all users data for group chat 

app.use("/api/v1/get", AllUserRouter)

// creating a new group route 

app.use("/api/v1/group", GroupRouter)

//route for  get all the group list in which   login user is added   

app.use("/api/v1/group" , GetAllUserListRouter)


// get the group messages 

app.use("/api/v1/group", GroupMessagesRoute)




/* =======================
   START SERVER
======================= */
const start = async () => {

  try {
    await initlistenClient()
    
     // Socket initilize karo
     initSocket(httpServer)

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start()

