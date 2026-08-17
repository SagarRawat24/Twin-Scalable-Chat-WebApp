import { Plus, X, ArrowRight } from "lucide-react"
import { useAddUserGroup } from "@/Store/toggle"
import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useGroup } from "@/Store/GroupStrore"
import { authClient } from "@/lib/auth_client"
import { useEffect } from "react"
import { toast } from "sonner";

const modalVariants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 22 }
    },
    exit: {
        opacity: 0,
        scale: 0.88,
        transition: { duration: 0.3, ease: "easeIn" }
    }
}

type AllUsers = {
    id: string
    name: string
    image: string | null
}

export default function AddUserGroup() {
    const show = useAddUserGroup((s) => s.show)

    // store se zaroorat ki cheezein nikal lo
    const group = useGroup((s) => s.group)
    const setGroupName = useGroup((s) => s.setGroupName)
    const toggleuser = useGroup((s) => s.toggleUser)
    const reset = useGroup((s) => s.reset)
    const createdBy = useGroup((s) => s.setcreatedBy)
    const getrequest = useGroup((s) => s.getrequest)



    // kisne banaya group
    async function getUserLogin() {
        const result = await authClient.getSession();

        const userID = result.data?.user.id;

        if (userID) {
            createdBy(userID)
        }
    }

    useEffect(() => {
        getUserLogin()
    }, [])


    //  naam ki validity check karne wala helper — trim() zaroori hai
    // taaki sirf spaces ("   ") bhi galti se valid group-name na ban jaye
    const isNameValid = group.groupName?.trim().length > 0


    //sending data to the backend 

    async function postGroupData() {

        //  agar naam khaali/sirf-spaces hai, toh yahin rok do —
        // backend call hi mat karo
        if (!isNameValid) {
            toast.error("Please enter a group name before creating")
            return
        }

        try {
            const res = await axios.post("http://localhost:8000/api/v1/group/data", group, { withCredentials: true })
            

            getrequest()

            toast.success(`${res.data?.groupName} group is successfully  created `)
            reset(); // clear group data from store
            show();  // close modal
        } catch (err) {
            console.error("failed to post the group data", err)
            toast.error("Failed to create Group")
        }
    }




    const { data: users, isLoading, isError } = useQuery<AllUsers[]>({
        queryKey: ["users"],
        queryFn: async () => {
            const response = await axios.get("http://localhost:8000/api/v1/get/allUsers")
            return response.data.data
        },
        staleTime: 1000 * 60 * 2,
    })

  

    return (
        <motion.div
            key="modal-overlay"
            className="fixed inset-0 py-16 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={show}
        >
            <motion.div
                className="relative w-full  max-w-md h-auto rounded-md bg-white dark:bg-[#0a0a0a] border-2 border-black/10 dark:border-white/10 overflow-y-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="relative w-full min-h-[110px] rounded-t-md bg-white   dark:bg-[#0a0a0a] border-b-2 border-black/10 dark:border-white/5 flex items-center px-3">
                    <span className="absolute top-4 text-sm font-medium ">Create Group</span>

                    <button
                        onClick={() => {
                            show()
                            reset()
                        }}
                        className="absolute top-4 right-2 p-1 rounded-md hover:bg-red-500 transition-all duration-300"
                    >
                        <X size={18} />
                    </button>


                    <div className="absolute bottom-4.5 right-2 left-2 h-fit  max-w-md ">

                        <input
                            type="text"
                            placeholder="Name the Group"
                            value={group.groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="px-4 w-full text-sm border-1 bg-white dark:bg-[#1a1a1a] text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-blue-500 py-2 rounded-md"
                        />
                    </div>

                </div>

                {/* Body */}
                {isLoading && (

                    <h1 className="text-base text-gray-400 font-medium  text-center my-4"> Wait Fetching User</h1>

                )}

                {isError && (
                    <p className="text-center text-sm text-red-400 py-6">
                        Failed to load users. Please try again.
                    </p>
                )}

                {!isLoading && !isError && users?.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-6">No users found.</p>
                )}

                <ul className="space-y-2 w-full p-2">
                    {users?.map((user) => (
                        <li
                            key={user.id}
                            className="flex justify-between items-center w-full p-3 rounded-md hover:bg-black/10 dark:hover:bg-white/10"
                        >
                            <div className="flex items-center space-x-4">
                                <img
                                    src={user.image || "/user.png"}
                                    alt={user.name}
                                    className="size-10 rounded-full object-cover"
                                />
                                <span className="font-medium text-lg dark:text-white">
                                    {user.name}
                                </span>
                            </div>
                            <button
                                onClick={() => toggleuser({ userId: user.id, userName: user.name, })}
                                className="p-3 border transition-transform duration-300 active:scale-95 hover:bg-blue-500 dark:hover:bg-blue-600 rounded-full">
                                <Plus size={16} />
                            </button>
                        </li>
                    ))}
                </ul>


                <div className="flex text-sm items-center justify-between px-5 py-4 border-2 dark:border-t-white/5 border-b-0 border-x-0  max-w-md">

                    <span>Selected {group.totalUsers}</span>

                
                    <button
                        onClick={postGroupData}
                        disabled={!isNameValid}
                        title={!isNameValid ? "Enter a group name first" : undefined}
                        className="bottom-2 right-0 flex items-center py-2 px-3 text-sm gap-1 rounded-md bg-blue-500 hover:bg-blue-600  border border-black/30 dark:border-white/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    >
                        Create <ArrowRight size={14} />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}