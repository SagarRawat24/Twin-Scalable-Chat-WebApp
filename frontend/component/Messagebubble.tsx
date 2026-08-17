'use client'
import { Message } from "@/types/chalist"
import { motion } from "framer-motion"

type props = {
    message: Message
    currentUserId: string
}

export default function Messagebubble({ message, currentUserId }: props) {

    if (!message?.sender) return null

    const checkMe = message.senderUserId === currentUserId
    const hasImage = !!message.imageUrl
    const hasText = !!message.body?.trim()

    const timeStr = new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })

    return (
        <motion.div
            className={`mx-7 mb-5 flex ${checkMe ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, x: checkMe ? 20 : -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
        >

            {/* ── IMAGE MESSAGE ── */}
            {hasImage && (
                <div className={`relative rounded-lg overflow-hidden shadow-md max-w-[260px] w-full p-0.5   bg-[#2a2a2a]
                    ${checkMe ? "rounded-br-none bg-blue-600" : "rounded-bl-none"}`}
                >
                    {/* Image */}
                    <img
                        src={message.imageUrl!}
                        alt="sent image"
                        className="w-full object-cover block max-h-[320px] rounded-lg"
                        loading="lazy"
                    />

                    {/* Gradient + time inside image */}
                    <div className="absolute bottom-0 left-0 right-0 h-8
                        bg-gradient-to-t from-black/60 to-transparent" />

                    <span className="absolute bottom-1.5 right-2 text-[10px] font-medium text-white/90">
                        {timeStr}
                    </span>

                    {/* Caption agar ho */}
                    {hasText && (
                        <div className={`px-3 py-1.5 rounded-sm
                            ${checkMe
                                ? "bg-blue-600 text-white"
                                : "bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white"
                            }`}
                        >
                            <div className="flex items-end gap-4">
                                <p className="text-sm leading-snug">{message.body}</p>
                                <span className={`text-[10px] shrink-0 font-medium mb-0.5
                                    ${checkMe ? "text-blue-100" : "text-gray-400"}`}>
                            
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── TEXT ONLY MESSAGE ── */}
            {!hasImage && hasText && (
                <div className={`relative max-w-xs px-3 py-1 rounded-lg text-sm
                    ${checkMe
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white rounded-bl-none"
                    }`}
                >
                    <div className="flex items-end gap-5">
                        <p className="text-sm leading-snug">{message.body}</p>
                        <p className={`text-[10px] mt-3 shrink-0 font-medium
                            ${checkMe ? "text-blue-100" : "text-gray-400"}`}>
                            {timeStr}
                        </p>
                    </div>

                    {/* Chat tail */}
                    <div className={`absolute bottom-0 w-3 h-3
                        ${checkMe
                            ? "-right-1.5 bg-blue-500 [clip-path:polygon(0_0,0%_100%,100%_100%)]"
                            : "-left-1.5 bg-white dark:bg-[#2a2a2a] [clip-path:polygon(100%_0,0%_100%,100%_100%)]"
                        }`}
                    />
                </div>
            )}

        </motion.div>
    )
}