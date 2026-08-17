"use client"

import {  useState } from "react"
import { X, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

type ImageItem = {
    id: string
    file: File
    previewUrl: string
}

type Props = {
    // Initial file jo user ne select kiya tha (Paperclip se)
    initialFile: File
    // Jab send press ho — (caption, files[]) milega parent ko
    onSend: (caption: string, files: File[]) => void
    // Jab X press ho — panel band karo
    onClose: () => void
}

export default function ImagePreviewPanel({ initialFile, onSend, onClose }: Props) {

    // Sab selected images ki list
    const [images, setImages] = useState<ImageItem[]>([
        {
            id: crypto.randomUUID(),
            file: initialFile,
            previewUrl: URL.createObjectURL(initialFile),
        }
    ])

    // Abhi konsi image badi dikhi rahi hai
    const [activeId, setActiveId] = useState<string>(images[0].id)
    const [caption, setCaption] = useState("")

    const activeImage = images.find((img) => img.id === activeId) ?? images[0]

    // ── Ek image remove karo ─────────────────────────
    function handleRemove(id: string) {
        // Agar sirf ek image hai toh panel band karo
        if (images.length === 1) {
            onClose()
            return
        }

        const idx = images.findIndex((img) => img.id === id)
        const updated = images.filter((img) => img.id !== id)
        setImages(updated)

        // Active image adjust karo
        if (activeId === id) {
            // Previous ya next mein se koi select karo
            const newActive = updated[Math.min(idx, updated.length - 1)]
            setActiveId(newActive.id)
        }
    }

    // ── Send karo ────────────────────────────────────
    function handleSend() {
        if (!images.length) return
        onSend(caption, images.map((img) => img.file))
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
        if (e.key === "Escape") onClose()
    }

    return (
        <motion.div
            className="flex flex-col w-full h-full dark:bg-[#111] rounded-md overflow-hidden "
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
        >
            {/* ── Top bar ── */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
                <button
                    onClick={onClose}
                    className="text-white/40 hover:text-white/80 transition-colors p-1 rounded-full hover:bg-white/10"
                >
                     <X size={18} /> 
                </button>
            </div>

            {/* ── Main image preview ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-2 min-h-0 ">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeImage.id}
                        src={activeImage.previewUrl}
                        alt="preview"
                        className="max-w-full max-h-full object-contain rounded-xl border-2 dark:border-white/20"
                        style={{ maxHeight: "calc(30vh - 28px)" }}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    />
                </AnimatePresence>
            </div>

            {/* ── Caption input + Send button ── */}
            <div className="shrink-0 flex items-center  gap-3 px-4 py-3">
                <input
                    autoFocus
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a caption…"
                    className="flex-1 bg-gray-100 dark:bg-[#1e1e1e] text-black/80 dark:text-white/80 dark:placeholder:text-white/30
                    rounded-lg px-5 py-2.5 text-sm outline-none border border-black/20 dark:border-white/10 
                    focus:border-blue-500 transition-colors"
                />
                <button
                    onClick={handleSend}
                    className="p-3 rounded-full bg-blue-500 hover:bg-blue-400
                    flex items-center justify-center shrink-0
                    transition-all duration-200 active:scale-90 shadow-lg shadow-blue-900/30"
                >
                    <Send size={14} className="text-white translate-x-px" />
                </button>
            </div>

            {/* ── Thumbnail strip ── */}
            <div className="shrink-0 flex items-center gap-2 px-4 pb-4 overflow-x-auto">

                {images.map((img) => (
                    <div
                        key={img.id}
                        className="relative group shrink-0 cursor-pointer"
                        onClick={() => setActiveId(img.id)}
                    >
                        {/* Thumbnail */}
                        <div className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-150
                            ${img.id === activeId
                                ? "border-blue-500 scale-105"
                                : "border-transparent opacity-60 hover:opacity-90"
                            }`}
                        >
                            <img
                                src={img.previewUrl}
                                alt="thumb"
                                className="w-full h-full object-cover"
                            />
                        </div>

                       
                    </div>
                ))}


            </div>
        </motion.div>
    )
}