"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGoogle } from "@fortawesome/free-brands-svg-icons"
import Link from "next/link"
import { motion } from "framer-motion"
import { itemVariants } from "../layout"
import { authClient } from "@/lib/auth_client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Spinner } from "@/component/spinner"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { useState } from "react"


const signupschema = z.object({
  email: z.string().email("Invalid Email!"),
  username: z
    .string()
    .min(3, "Username must have at least 3 characters")
    .max(30, "Username length exceeded"),
  password: z
    .string()
    .min(6, "Password must have at least 6 characters")
    .regex(/[0-9]/, { message: "Password must include a number" })
    .regex(/[^A-Za-z0-9]/, {
      message: "Password must include a special character",
    }),
})

type SignupForm = z.infer<typeof signupschema>

export default function SignupPage() {
  const router = useRouter()

  const [showpass, setshowpass] = useState(false)

  const togglepass = () => setshowpass((prev) => !prev)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupschema),
  })

  const onSubmit = async (data: SignupForm) => {
    const { error } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.username,
    })

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success("Welcome to Line! 🎉")
    router.push("/")
  }

  const handleGoogleSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000",
      })
    } catch (error) {
      console.error("Google sign up error:", error)
      toast.error("Google sign up failed")
    }
  }

  return (
    <div className="flex font-gesit justify-center items-center min-h-screen">
      <motion.div
        variants={itemVariants}
        className="w-full max-w-sm shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:bg-[#141414] rounded-md"
      >
        <motion.h1
          variants={itemVariants}
          className="text-center text-xl mt-5 font-semibold dark:text-white text-black"
        >
          Sign Up
        </motion.h1>

        <div className="mt-6 mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

            {/* FIX 1: Removed <Skeleton> wrapper — was hiding all fields when isSubmitting=false */}
            <div className="flex flex-col space-y-8">

              {/* Username */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold ml-9 mb-1 dark:text-white text-black">
                  Username
                </label>
                <div className="relative w-5/6 mx-auto rounded-md">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  {/* FIX 2: Added text-black and dark:placeholder-gray-500 */}
                  <input
                    {...register("username")}
                    placeholder="Alex Smith"
                    className={`outline-none text-sm py-2 px-10
                      bg-white text-black placeholder-gray-400
                      dark:bg-[#212121] dark:text-white dark:placeholder-gray-500
                      mx-auto border-2 w-full rounded-md 
                      focus:border-blue-500
                      ${errors.username ? "border-red-400" : "border-gray-400"}`}
                  />
                </div>
                {/* FIX 3: Moved error outside relative div so it's not clipped */}
                {errors.username && (
                  <p className="ml-9 text-red-500 text-xs mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold ml-9 mb-1 dark:text-white text-black">
                  Email
                </label>
                <div className="relative w-5/6 mx-auto rounded-md">
                  <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  {/* FIX 4: Added text-black and placeholder colors for both modes */}
                  <input
                    {...register("email")}
                    placeholder="john123@gmail.com"
                    className={`outline-none text-sm py-2 px-10
                      bg-white text-black placeholder-gray-400
                      dark:bg-[#212121] dark:text-white dark:placeholder-gray-500
                      mx-auto border-2 w-full rounded-md
                      focus:border-blue-500
                      ${errors.email ? "border-red-400" : "border-gray-400"}`}
                  />
                </div>
                {/* FIX 5: Email error was missing entirely — added it */}
                {errors.email && (
                  <p className="ml-9 text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold ml-9 mb-1 dark:text-white text-black">
                  Password
                </label>
                <div className="relative w-5/6 mx-auto rounded-md">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={togglepass}
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showpass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {/* FIX 6: Added text-black + dark:text-white — password text was invisible */}
                  <input
                    type={showpass ? "text" : "password"}
                    {...register("password")}
                    className={`outline-none w-full text-sm border-2 py-2
                      bg-white text-black placeholder-gray-400
                      dark:bg-[#212121] dark:text-white dark:placeholder-gray-500
                      px-10 mx-auto rounded-md
                      focus:border-blue-600 focus:border-2
                      ${errors.password ? "border-red-400" : "border-gray-400"}`}
                  />
                </div>
                {/* FIX 7: Moved error outside relative div + changed h2 → p */}
                {errors.password && (
                  <p className="ml-9 text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

            </div>
            {/* End of fields */}

            {/* Submit Button */}
            {/* FIX 8: Button text said "Sign In" on the signup page — fixed to "Create Account" */}
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
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center opacity-25 gap-1 mx-6 my-4">
              <div className="h-px flex-1 bg-gray-600" />
              <span className="text-gray-500 text-sm">or</span>
              <div className="h-px flex-1 bg-gray-600" />
            </div>

            {/* Google OAuth */}
            <motion.button
              type="button"
              onClick={handleGoogleSignUp}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.99 }}
              className="mb-6 w-5/6 py-2 mx-auto rounded-md text-sm font-semibold text-white
                bg-gradient-to-b from-blue-500 to-blue-800
                flex items-center justify-center gap-2"
            >
              <FontAwesomeIcon icon={faGoogle} />
              Continue with Google
            </motion.button>

            <p className="text-sm text-center opacity-75 dark:text-white text-black mb-2">
              Already have an account?
              <Link href="/signin">
                <span className="ml-1 font-semibold text-blue-600 cursor-pointer">
                  Sign In
                </span>
              </Link>
            </p>

          </form>
        </div>
      </motion.div>
    </div>
  )
}