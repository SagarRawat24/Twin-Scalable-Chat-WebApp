'use client'

import { useEffect, useRef, useState } from "react"
import { getSocket } from "@/lib/socket"
import {  GroupMessage, Message } from "@/types/chalist"
import axios from "axios"
import { selectedChat } from "@/Store/chatbox"
import { useOnlineUserStore } from "@/Store/onlineusers"


const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
})

export function useChat(currentUserId: string, selectedChat: selectedChat | null) {

    const [messages, setmessages] = useState<(Message | GroupMessage)[]>([])
    const [isLoading, setisLoading] = useState(false)
    const { setOnlineUser, addOnlineUser, removeOnlineUser } = useOnlineUserStore()
    const socket = currentUserId ? getSocket(currentUserId) : null


   

    const selectedChatRef = useRef(selectedChat)

    // jiska sirf ek kaam hai: jab bhi selectedChat (state) change ho, us box ke .current ko update kar do latest value 
    // matlab ye effect har baar chalega jab selectedChat badlega (Rahul → Priya → koi group → etc), turant sync kar dega.
    useEffect(() => {
        selectedChatRef.current = selectedChat   // har render pe latest value update hoti rahegi
    }, [selectedChat])

    // incoming messages (1 to 1 + group dono) 
    useEffect(() => {

        if (!socket) return

        socket.on("message:receive", (message: Message) => {
           

            //  fix: sirf tabhi add karo jab ye message current open
            // 1-on-1 chat se related ho — warna doosre user ka message
            // bhi galti se current chat mein mix ho jayega
            const chat = selectedChatRef.current
            if (

                // this is used to check is that same user chat that i login
                chat?.type === "user" &&
                (message.senderUserId === chat.data.addedUserId ||
                 message.receiverUserId === chat.data.addedUserId)
            ) {

                // duplicate prevent krne ke liye same msg emit na ho 
                setmessages((prev) => {
                    if (prev.some((m) => (m as Message).id === message.id)) return prev
                    return [...prev, message]
                })
            }
        })

        socket.on("Groupmsg:receive", (raw: any) => {

            

            // from flat to nested object banaya h 
            const Groupmsg: GroupMessage = {
                id: raw.id,
                groupId: raw.groupid,
                body: raw.body,
                imageUrl: raw.imageUrl,
                createdAt: raw.createdAt,
                sender: {
                    id: raw.senderid,
                    name: raw.sendername,
                    image: raw.senderimage ?? null,
                },
            }
            
            //filter karo ki current open chat isi group ka hai, aur duplicate check karo

            const chat = selectedChatRef.current
            if (chat?.type === "group" && chat.data.groupId === Groupmsg.groupId) {
                setmessages((prev) => {
                    if (prev.some((m) => (m as GroupMessage).id === Groupmsg.id)) return prev
                    return [...prev, Groupmsg]
                })
            }
        })


        return () => {
            socket.off("message:receive")
            socket.off("Groupmsg:receive")
        }
    }, [socket])



    //  Fetch messages jab bhi selection change ho (user ya group) 
    useEffect(() => {
        if (!selectedChat) return

        async function fetchMessages() {
            try {
                setisLoading(true)
                setmessages([])

                let data

                if (selectedChat!.type === "user") {
                    const res = await api.get(
                        `/api/v1/chat/messages/${selectedChat!.data.addedUserId}`
                    )
                    data = res.data
                } else {
                    const res = await api.get(
                        `/api/v1/group/messages/${selectedChat!.data.groupId}`
                    )
                    data = res.data
                }

                
                setmessages(data.messages)
            } catch (err) {
                console.error("messages did not fetch", err)
            } finally {
                setisLoading(false)
            }
        }

        fetchMessages()
    }, [selectedChat])


    

    // ── Send message (user ya group ke hisaab se alag payload) ──
    function sendMessage(body: string, imageUrl?: string) {
        if (!selectedChat || !socket) return   // ✅ FIX: socket null-check add kiya
        if (!body.trim() && !imageUrl) return

        if (selectedChat.type === "user") {
            
            socket.emit('message:send', {
                receiverUserId: selectedChat.data.addedUserId,
                body: body.trim() || null,
                imageUrl: imageUrl ?? null,
            })
        } else {
            socket.emit('Groupmsg:send', {
                senderid: currentUserId,
                groupId: selectedChat.data.groupId,
                body: body.trim() || null,
                imageUrl: imageUrl ?? null,
            })
        }
    }

    //  Online/offline tracking 
    useEffect(() => {
        if (!socket) return   // ✅ FIX: null-check add kiya

        socket.on("online-users", (users: { userId: string, socketId: string }[]) => {
            setOnlineUser(users)
        })

        socket.on("user-connected", (user: { userId: string, socketId: string }) => {
            addOnlineUser(user)
        })

        socket.on("user-disconnected", (userId: string) => {
            removeOnlineUser(userId)
        })

        return () => {
            socket.off("online-users")
            socket.off("user-connected")
            socket.off("user-disconnected")
        }
    }, [socket])   // ✅ FIX: [] ki jagah [socket] — jab socket available ho tabhi listener lage

    return {
        messages,
        isLoading,
        sendMessage,
    }
}