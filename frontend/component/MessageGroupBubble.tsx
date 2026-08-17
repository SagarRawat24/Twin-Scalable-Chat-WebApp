'use client'
import { motion } from "framer-motion"
import { GroupMessage } from "@/types/chalist"

type Props = {
  message: GroupMessage
  currentUserId: string
  showHeader: boolean
}



export default function GroupMessagebubble({ message, currentUserId, showHeader }: Props) {
   



    //   "sender" object ke andar se id/name/image nikalna hai,
    // flat "senderid"/"sendername" exist hi nahi karte naye type mein
    const checkMe:boolean = message.sender.id === currentUserId
    const hasImage:boolean = !!message.imageUrl
    const hasText:boolean = !!message.body?.trim()

    const timeStr = new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })

    return (
        <motion.div
            //  consecutive messages (same sender) ke beech kam gap,
            // naye sender ke pehle message pe zyada gap — WhatsApp jaisa look
            className={`mx-7 flex items-end gap-2 ${checkMe ? "justify-end" : "justify-start"} ${showHeader ? "mt-3 mb-1" : "mb-1"}`}
            initial={{ opacity: 0, x: checkMe ? 20 : -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
        >
         
         {/* if iam user or blue one dont show the avatar */}
            {!checkMe && (
                showHeader ? (
                    <div className="w-[26px] h-[26px] rounded-full overflow-hidden shrink-0 bg-gray-300 dark:bg-[#2a2a2a]">
                        <img
                            src={message.sender.image || "/user.png"}
                            alt={message.sender.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                   
                    <div className="w-[26px] shrink-0" />
                )
            )}

            <div className={checkMe ? "" : "flex flex-col items-start max-w-xs"}>

                {!checkMe && showHeader && (
                    <span className="text-[12px] font-semibold mb-1 ml-1 text-blue-500">
                        {message.sender.name}
                    </span>
                )}
                
                {/* this is for only image + text  */}
                {hasImage && (
                    <div className={`relative rounded-lg overflow-hidden shadow-md max-w-[260px] w-full p-0.5 bg-[#2a2a2a]
                        ${checkMe ? "rounded-br-none bg-blue-600" : "rounded-bl-none"}`}
                    >
                        <img
                            src={message.imageUrl!}
                            alt="sent image"
                            className="w-full object-cover block max-h-[320px] rounded-lg"
                            loading="lazy"
                        />
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-1.5 right-2 text-[10px] font-medium text-white/90">
                            {timeStr}
                        </span>
                        {hasText && (
                            <div className={`px-3 py-1.5 rounded-sm
                                ${checkMe ? "bg-blue-600 text-white" : "bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-white"}`}
                            >
                                <p className="text-sm leading-snug">{message.body}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* only for text agar hasimage nahi jo true hoga = true sath m agar hastext =true hoga tabhi ye component show krna    */}

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
                        <div className={`absolute bottom-0 w-3 h-3
                            ${checkMe
                                ? "-right-1.5 bg-blue-500 [clip-path:polygon(0_0,0%_100%,100%_100%)]"
                                : "-left-1.5 bg-white dark:bg-[#2a2a2a] [clip-path:polygon(100%_0,0%_100%,100%_100%)]"
                            }`}
                        />
                    </div>
                )}

            </div>
        </motion.div>
    )
}