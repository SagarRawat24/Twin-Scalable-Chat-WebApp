"use client"
import { Send, Smile, Paperclip } from "lucide-react"
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react"

import { useSelectedUser } from "@/Store/chatbox"
import { useEffect, useRef, useState } from "react"
import { useChat } from "@/hooks/useChat"
import Messagebubble from "./Messagebubble"
import axios from "axios"
import ImagePreviewPanel from "./imagepreview"
import { AnimatePresence } from "framer-motion"
import GroupMessagebubble from "./MessageGroupBubble"
import { Message, GroupMessage } from "@/types/chalist"
import { useTheme } from "next-themes"

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
})

type Props = {
    currentuserId: string
}

export default function ChatUi({ currentuserId }: Props) { 

    const { theme } = useTheme()

    // jab user file select karta hai but abhi tak "send" nahi dabaya, wo file yahan hold hoti hai. Ye state hi decide karta hai ki UI mein preview panel dikhana hai ya normal input bar (neeche dekhna).
    const [pendingfile, setpendingfile] = useState<File | null>(null)

    //upload ke dauran loading state, taaki UI ko pata chale "abhi Cloudinary pe upload chal raha hai"
    const [isupload, setisupload] = useState<boolean>(false)

    // emoji picker khula hai ya nahi
    const [showemoji, setshowemoji] = useState<boolean>(false)

    // which chat is open user or group 
    const selectedChat = useSelectedUser((state) => state.selectedChat)

    //hook ko currentuserId aur selectedChat diya, wapas milta hai: current chat ke messages, loading state, aur ek 
    //sendMessage function. Hook internally decide karta hai ki DM hai ya group based on selectedChat.type, socket join/leave karta
    const { messages, isLoading, sendMessage } = useChat(currentuserId, selectedChat)

    //Auto-scroll ke liye ek invisible div ka ref — chat area ke bottom mein rakha hai, naya message aane pe usi pe scroll karenge.
    const bottemref = useRef<HTMLDivElement>(null)

    // text Input start m empty
    const [input, setinput] = useState<string>("")

    const fileupload = useRef<HTMLInputElement | null>(null)

    // input ka DOM reference — cursor position pata karne ke liye, taaki emoji cursor ki jagah insert ho
    const inputref = useRef<HTMLInputElement | null>(null)

    // emoji picker ke bahar click hote hi band karne ke liye wrapper ka ref
    const pickerref = useRef<HTMLDivElement | null>(null)

    // Paperclip button click → hidden file input ko programmatically click karwa dena. Isse browser ka native file-picker dialog khulta hai
    const handleupload = () => {
        fileupload?.current?.click()
    }


    // after file selection validation 
    const handlefile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith("image/")) return
        if (file.size > 5 * 1024 * 1024) {
            alert("image must be under 5 MB")
            return
        }
        setpendingfile(file)
        event.target.value = ""
    }

    // Actual Cloudinary upload call — FormData isliye kyunki binary file bhejna hai, JSON se nahi ho sakta. Backend (multer) is se file nikalta hai, 
    // Cloudinary pe upload karta hai, URL wapas bhejta hai — wahi URL yahan return ho raha hai.
    async function uploadFile(file: File): Promise<string> {
        const formdata = new FormData()
        formdata.append("file", file)
        const { data } = await api.post("/api/v1/message/imageupload", formdata, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return data.url as string
    }


    // "upload only after user confirms send, not on file selection" — usi ka implementation hai. File select hote hi upload nahi hota, sirf pendingfile 
    // set hota hai (preview dikhta hai). Jab user preview panel mein "Send" dabata hai, tab ye function call hota hai.

    async function handlepreviewsend(caption: string, files: File[]) {
        const file = files[0]
        if (!file) return

        try {
            setisupload(true)
            setpendingfile(null)
            const imageUrl = await uploadFile(file)
            sendMessage(caption, imageUrl)
        } catch (err) {
         
        } finally {
            setisupload(false)
        }
    }


    //ab bhi messages array change ho (naya message aaya, chahe khud bheja ho ya socket se receive hua), bottom tak smooth scroll. Dependency array mein [messages] hai isliye ye har naye message pe fire hoga.

    useEffect(() => {
        bottemref.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // handler for the input 
    function handleSend() {
        if (!input.trim()) return
        sendMessage(input)
        setinput("")
        setshowemoji(false)
    }

    //Enter = send, Shift+Enter = newline (Shift dabaya hua nahi hai to hi send karo). preventDefault() isliye taaki plain Enter pe textarea mein newline na chala jaye (though ye <input> hai to newline 
    // waise bhi nahi hota, but ye future-proofing hai agar <textarea> mein convert kare).
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // emoji click hote hi cursor position pe insert karo, end mein nahi — taaki beech mein type karte waqt bhi natural feel aaye
    function handleEmojiClick(emojiData: EmojiClickData) {
        const cursorPos = inputref.current?.selectionStart ?? input.length
        const newText = input.slice(0, cursorPos) + emojiData.emoji + input.slice(cursorPos)
        setinput(newText)
        // picker turant band nahi kar rahe — multiple emoji ek ke baad ek chun sake, WhatsApp jaisa UX
    }

    // emoji picker ke bahar kahin bhi click ho to picker band ho jaye
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (pickerref.current && !pickerref.current.contains(e.target as Node)) {
                setshowemoji(false)
            }
        }
        if (showemoji) {
            document.addEventListener("mousedown", handleClickOutside)
        }
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [showemoji])


    //fix kra h  "as unknown as" wala double-cast hataya — GroupMessage
    // already (Message | GroupMessage)[] union ka member hai, isliye
    // direct assertion type-safe hai aur galat mixing pakad sakta hai
    const groupMessages: GroupMessage[] =
        selectedChat?.type === "group" ? (messages as GroupMessage[]) : []

    const directMessages: Message[] =
        selectedChat?.type === "user" ? (messages as Message[]) : []

    return (
        <div className="bg-white dark:bg-[#0a0a0a] border-black/10 h-full rounded-md">

            {selectedChat ? (
                <div className="h-full w-full flex flex-col overflow-hidden">

                    {/* 🔵 Header — user aur group alag render */}
                    <div className="shrink-0 flex p-5 bg-white text-black/80 dark:text-white/80 dark:bg-[#0a0a0a] h-20 border items-center">
                        {selectedChat.type === "user" ? (
                            <>
                                <img
                                    src={selectedChat.data.image ?? "/user.png"}
                                    className="w-11 h-11 rounded-full object-cover"
                                />
                                <div className="px-2 space-y-1 w-fit">
                                    <h2 className="text-base font-semibold">{selectedChat.data.name}</h2>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative group flex items-center">
                                    <img
                                        src={"/group.png"}
                                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                                    />

                                    <div className="px-2 space-y-1 w-fit">
                                        <h2 className="text-base font-semibold">{selectedChat.data.groupName}</h2>
                                        <p className="text-xs text-gray-400">
                                            {selectedChat.data.totalUsers} members
                                        </p>
                                    </div>

                                    {/* Hover dropdown - member list */}
                                    <div
                                        className="
                                            absolute top-full left-0 mt-2 w-56
                                            bg-white dark:bg-[#2a2a2a]  text-black/80 dark:text-white/80
                                            rounded-lg shadow-lg
                                            border border-black/20
                                            opacity-0 invisible
                                            group-hover:opacity-100 group-hover:visible
                                            transition-all duration-150
                                            z-50
                                            max-h-64 overflow-y-auto"

                                    >
                                        <p className="px-3 pt-2 pb-1 text-xs text-gray-400 font-medium">
                                            Members
                                        </p>
                                        {selectedChat.data.groupList?.map((member) => (
                                            <div
                                                key={member.userId}
                                                className="flex items-center gap-2 px-3 py-2 "
                                            >
                                                <img
                                                    src={"/user.png"}
                                                    className="w-7 h-7 rounded-full object-cover"
                                                />
                                                <span className="text-sm">{member.userName}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* ⚫ Chat Area */}
                    <div className="bg-black/5 dark:bg-white/1 border w-full flex-1 overflow-y-auto">
                        {!isLoading && messages.length === 0 && (
                            <div className="flex items-center justify-center">
                                <img src={"/doodle.png"} className="size-100 mt-10 object-cover" />
                            </div>
                        )}


                        {/* Loading complete ho chuki hai but messages khali hain (naya chat, koi conversation nahi hua abhi tak) 
                        — tab empty-state doodle.   */}
                        {!isLoading && selectedChat.type === "group" &&
                            groupMessages.map((msg, index) => {
                                const prevMsg = groupMessages[index - 1]

                                const isFirstInGroup: boolean = !prevMsg || prevMsg.sender.id !== msg.sender.id

                                return (
                                    <GroupMessagebubble
                                        key={msg.id}
                                        message={msg}
                                        currentUserId={currentuserId}
                                        showHeader={isFirstInGroup}
                                    />
                                )
                            })}

                        {/* for one to one chat  */}
                        {!isLoading && selectedChat.type === "user" &&
                            directMessages.map((msg) => (
                                <Messagebubble key={msg.id} message={msg} currentUserId={currentuserId} />
                            ))}

                        {/* Ye wahi invisible marker div hai jispe humne upar scrollIntoView call kiya  */}
                        <div ref={bottemref} />
                    </div>

                    {/* ── Bottom: Preview Panel OR normal input bar ── */}
                    <AnimatePresence mode="wait">
                        {pendingfile ? (
                            <div key="preview" className="shrink-0 w-full h-absolute">
                                <ImagePreviewPanel
                                    initialFile={pendingfile}
                                    onSend={handlepreviewsend}
                                    onClose={() => setpendingfile(null)}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 py-2 px-5 w-full shrink-0">

                                <input ref={fileupload} type="file" className="hidden" onChange={handlefile} />

                                <button
                                    onClick={handleupload}
                                    className="cursor-pointer rounded-md text-gray-600 hover:bg-gray-200 dark:text-white p-2 flex items-center justify-center dark:opacity-50 dark:hover:bg-white/10 transition-all duration-200"
                                >
                                    <Paperclip size={16} />
                                </button>

                                {/* Emoji button + picker — relative wrapper taaki picker isi ke upar absolute position ho */}
                                <div className="relative" ref={pickerref}>
                                    <button
                                        onClick={() => setshowemoji((prev) => !prev)}
                                        className="cursor-pointer rounded-md text-gray-600 hover:bg-gray-200 dark:text-white p-2 flex items-center dark:opacity-50 justify-center dark:hover:bg-white/10 transition-all duration-200"
                                    >
                                        <Smile size={16} />
                                    </button>

                                    {showemoji && (
                                        <div className=" absolute bottom-12 left-0 z-50">
                                            <EmojiPicker
                                                onEmojiClick={handleEmojiClick}
                                                theme={theme === 'dark' ? Theme.DARK : Theme.LIGHT}
                                                emojiStyle={EmojiStyle.GOOGLE}
                                                skinTonesDisabled={true}
                                                previewConfig={{ showPreview: false }}
                                                searchDisabled={true}
                                                width={320}
                                                height={400}
                                            />
                                        </div>
                                    )}
                                </div>

                                <input
                                    ref={inputref}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setinput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message"
                                    className="border text-black bg-gray-50 border-gray-300 dark:bg-[#0A0A0A] dark:text-white/70 dark:border-white/10 px-4 py-2 w-full rounded-md text-sm outline-none"
                                />

                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim()}
                                    className="cursor-pointer rounded-md border border-blue-400 p-2 bg-blue-500 flex items-center justify-center transition-transform duration-300 active:scale-95"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        )}
                    </AnimatePresence>

                </div>
            ) : (
                <div className="py-40 px-80 w-full h-full">
                    <div className="w-full h-full flex items-center justify-center">
                        <img src="/logo.png" className="size-60 object-cover opacity-25" />
                    </div>
                </div>
            )}

        </div>
    )
}