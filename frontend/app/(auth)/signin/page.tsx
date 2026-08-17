"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import { motion } from "framer-motion";
import { itemVariants } from "../layout"
import { authClient } from "@/lib/auth_client";
import { toast } from "sonner";
import { useRouter } from "next/navigation"
import { Mail, Lock, EyeOff, Eye } from "lucide-react";
import { Spinner } from "@/component/spinner";
import { useState } from "react";


const signinschema = z.object({
    email: z.string().email("Invalid Email!"),
    password: z.string()
        .min(6, "Password must have at least 6 characters")
        .regex(/[0-9]/, { message: "Password must have at least one number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must include at least one special character" }),
})

type SignInform = z.infer<typeof signinschema>

export default function SignInPage() {
    const router = useRouter()
    const [showpass, setshowpass] = useState(false)

    const togglepass = () => setshowpass((prev) => !prev)

    const { register, handleSubmit, formState: { errors, isSubmitting } } =
        useForm<SignInform>({ resolver: zodResolver(signinschema) })

    const handleGoogleSignIn = async () => {
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: "http://localhost:3000",
            })
        } catch (error) {
            console.error("Google sign in error:", error)
            toast.error("Google login failed")
        }
    }

    const onSubmit = async (data: SignInform) => {
        const { error } = await authClient.signIn.email({
            email: data.email,
            password: data.password,
        })

        if (error) {
            toast.error(error.message)
            return
        }

        toast.success("Welcome back! 🎉")
        router.push("/")
    }

    return (
        <div  >
            <div className="flex font-gesit justify-center items-center min-h-screen ">
                <motion.div
                    variants={itemVariants}
                    className="w-full max-w-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-slate-200 dark:border-zinc-900 dark:bg-[#141414] rounded-md"
                >
                    <motion.h1
                        variants={itemVariants}
                        className="text-center text-xl mt-5 text-black dark:text-white font-semibold"
                    >
                        SignIn
                    </motion.h1>

                    <div className="mt-6 mb-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

                            {/* FIX 1: Removed <Skeleton> wrapper — it was hiding fields when isSubmitting=false */}
                            <div className="space-y-8 h-fit flex flex-col">

                                {/* Email Field */}
                                <motion.div className="flex flex-col" variants={itemVariants}>
                                    <motion.label
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.5 }}
                                        className="text-sm font-semibold ml-9 dark:text-white"
                                    >
                                        Email
                                    </motion.label>

                                    <div className="relative w-5/6 mx-auto rounded-md">
                                        <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            {...register("email")}
                                            placeholder="john123@gmail.com"
                                            className={`outline-none text-sm py-2 mx-auto
                                                bg-white text-black
                                                dark:bg-[#212121] dark:text-white dark:placeholder-gray-500
                                                px-10 border-2 w-full rounded-md
                                                focus:border-blue-500
                                                ${errors.email ? "border-red-400" : "border-gray-400"}`}
                                        />
                                    </div>

                                    {errors.email && (
                                        <p className="ml-9 text-red-500 text-xs mt-1">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </motion.div>

                                {/* Password Field */}
                                <motion.div className="flex flex-col" variants={itemVariants}>
                                    <motion.label
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: 0.6 }}
                                        className="text-sm font-semibold ml-9 dark:text-white"
                                    >
                                        Password
                                    </motion.label>

                                    <div className="relative w-5/6 mx-auto rounded-md">
                                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={togglepass}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                                        >
                                            {showpass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>

                                        {/* FIX 2: Added dark:text-white and light mode text-black — password text was invisible */}
                                        <input
                                            type={showpass ? "text" : "password"}
                                            {...register("password")}
                                            className={`outline-none w-full text-sm border-2 py-2
                                                bg-white text-black
                                                dark:bg-[#212121] dark:text-white dark:placeholder-gray-500
                                                px-10 mx-auto rounded-md
                                                focus:border-blue-600 focus:border-2
                                                ${errors.password ? "border-red-400" : "border-gray-400"}`}
                                        />
                                    </div>

                                    {/* FIX 3: Moved error message outside the relative div so it's not clipped */}
                                    {errors.password && (
                                        <p className="ml-9 text-red-500 text-xs mt-1">
                                            {errors.password.message}
                                        </p>
                                    )}
                                </motion.div>

                            </div>
                            {/* End of fields */}

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={!isSubmitting ? { scale: 1.04 } : undefined}
                                whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
                                className={`w-5/6 py-2 mx-auto mt-8 rounded-md text-sm font-semibold text-white
                                    bg-gradient-to-b from-blue-500 to-blue-800
                                    ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Spinner />
                                        Signing In...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </motion.button>

                            {/* Divider */}
                            <motion.div
                                variants={itemVariants}
                                className="flex items-center opacity-25 gap-1 mx-6 my-5 w-sm"
                            >
                                <div className="h-px flex-1 bg-gray-600" />
                                <span className="text-gray-500 text-sm font-medium">or</span>
                                <div className="h-px flex-1 bg-gray-600 mr-12" />
                            </motion.div>

                            {/* Google Sign In */}
                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, y: -2 }}
                                onClick={handleGoogleSignIn}
                                whileTap={{ scale: 0.98 }}
                                type="button"
                                className="mb-4 cursor-pointer w-5/6 py-2 mx-auto rounded-md text-sm font-semibold text-white
                                    bg-gradient-to-b from-blue-500 to-blue-800 transition-transform duration-150 ease-out
                                    hover:from-blue-400 hover:to-blue-600 transition-colors duration-300 ease-in-out
                                    active:scale-95"
                            >
                                <FontAwesomeIcon icon={faGoogle} className="text-white mr-1" />
                                Sign In With Google
                            </motion.button>

                            {/* Signup Link */}
                            <motion.p
                                variants={itemVariants}
                                className="opacity-75 text-sm font-medium mx-auto mb-2 dark:text-white text-black"
                            >
                                Create Account
                                <Link href="/signup">
                                    <span className="cursor-pointer font-semibold text-blue-600"> Signup</span>
                                </Link>
                            </motion.p>

                        </form>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}