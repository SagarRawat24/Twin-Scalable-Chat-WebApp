






<p align="center">
  <img
    width="70"
    height="70"
    alt="Twin Chat App Logo"
    src="https://github.com/user-attachments/assets/2409334e-98a0-45a4-b44b-d953c08355cb"
  />
</p>

<h1 align="center">Twin-Scalable-Chat-WebApp</h1>


<p align="center">
  A Real-Time Full stack Chat WebApp. Its support one to one messaging and Group chat 
  It build with Typescript and Socket.io library and Scale horizontally with the help
  of Redis infrastructure 
</p>

<p align="center">
<img width="100%"  alt="cursorful-video-1787146180010 (2)" src="https://github.com/user-attachments/assets/54eca076-eeeb-45bb-8934-c0b3149dc95c" />

</p>



####  Demo Video  --  https://github.com/user-attachments/assets/5bae55b3-af76-4fe9-8a65-b6b0f8be7f96

<div>



<h2>🎨 Frontend</h2>
<p>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui"/>
  <img src="https://img.shields.io/badge/TanStack%20Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query"/>
  <img src="https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion"/>
</p>

<h2>⚙️ Backend</h2>
<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.IO"/>
  <img src="https://img.shields.io/badge/Better%20Auth-000000?style=for-the-badge&logo=auth0&logoColor=white" alt="Better Auth"/>
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary"/>
</p>

<h2>🗄️ Database</h2>
<p>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Drizzle%20ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=000000" alt="Drizzle ORM"/>
</p>
</div>

## ✨ Features

- **Real-Time Messaging** — Instant one-to-one and group chat powered by Socket.IO, with messages delivered live to both sender and receiver without page refresh.

- **Image Sharing** — Send images in both DMs and group chats via Cloudinary-backed uploads, with WhatsApp-style previews, captions, and timestamp overlays on the image itself.

- **Live Online/Offline Presence** — See who's online in real time via a `Map<userId, Set<socketId>>`-based presence tracker that correctly handles multiple tabs/devices per user.

- **Persistent Chat History with Pagination** — Cursor-based "load more" pagination for both DM and group chat history, so old messages load smoothly without fetching the entire conversation at once.

- **Secure Cookie-Based Authentication** — Auth handled via Better Auth with email/password and Google OAuth sign-in, multi-session support (up to 5 sessions per user), and HTTP-only cookies.

- **Dynamic Chat List with Live Updates** — Contact list updates automatically via Server-Sent Events (SSE) + PostgreSQL LISTEN/NOTIFY whenever a new chat is added — no manual refresh needed.

- **Horizontally Scalable Backend** — Socket.IO is backed by a Redis pub/sub adapter (sharded adapter with `ioredis`), enabling the real-time layer to scale across multiple server instances.

- **Smart Query Caching with TanStack Query** — Chat list and group list are fetched and cached via React Query, with `staleTime: 0` + `refetchOnMount` ensuring data is always fresh the moment a user opens the app, without over-fetching on every render.

- **Centralized State with Zustand** — Lightweight, boilerplate-free global state (selected chat, group creation flow, online users, sidebar toggles) managed via multiple focused Zustand stores instead of one bloated context/provider.

- **Debounced Search to Cut Redundant API Calls** — User search input is debounced (700ms) before hitting the backend, paired with React Query's `enabled` flag so no request fires until the user actually stops typing — reducing unnecessary network load.

