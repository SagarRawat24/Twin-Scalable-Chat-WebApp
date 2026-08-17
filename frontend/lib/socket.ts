import { Socket, io } from 'socket.io-client'

let socket: Socket | null = null;
let currentSocketUserId: string | null = null;   // track karo kis userId se socket bana

export function getSocket(userId: string): Socket {
    // sirf tabhi purana socket reuse karo jab userId bhi match kare
    if (socket && currentSocketUserId === userId) {
        return socket
    }

    //  agar socket hai lekin userId mismatch hai — purana disconnect karo
    if (socket) {
        socket.disconnect()
        socket = null
    }

    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000", {
        auth: { userId },
        withCredentials: true,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
    })

    currentSocketUserId = userId
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect()
        socket = null
        currentSocketUserId = null
    }
}