import { create } from "zustand";
import axios from "axios";

interface UserData {
    userId: string;
    userName: string;
}

interface Group {
    groupId: string;
    groupName: string;
    groupList: UserData[];
    totalUsers: number;
    createdBy: string
};


type GroupStore = {
    group: Group
    setGroupName: (name: string) => void
    setGroupId: (id: string) => void
    setcreatedBy: (id: string) => void
    addUser: (user: UserData) => void
    removeUser: (userId: string) => void
    toggleUser: (user: UserData) => void
    getrequest: () => Promise<unknown>
    reset: () => void


}

const initialGroup: Group = {
    groupId: "",
    groupName: "",
    groupList: [],
    totalUsers: 0,
    createdBy: ""
}

// basically ye sab group create krte time use hoge 

export const useGroup = create<GroupStore>((set, get) => ({

    group: initialGroup,

    // koi particular group kisne create kia  and pura group rpdate kr do 

    setcreatedBy: (id) => set((state) => ({
        group: { ...state.group, createdBy: id }
    })),


    // groupname set krne k liye  and pura group update kr do 

    setGroupName: (name) => set((state) => ({
        group: { ...state.group, groupName: name }
    })),


    // group id get kr ke pura group update kr do 

    setGroupId: (id) => set((state) => ({
        group: { ...state.group, groupId: id }
    })),


    // get all the list of the user from the backend  in the ui 

    getrequest: async () => {

        try {
            const response = await axios.get("http://localhost:8000/api/v1/group/fetch_user", { withCredentials: true })

            return response.data
        } catch (error) {
            console.error(error)
        }

    },
  
   
    // this add the user in the group list and also make sure a particular user not added  twice 
    addUser: (user) =>
        set((state) => {
            const exists = state.group.groupList.some(
                (u) => u.userId === user.userId
            )
            if (exists) return state // duplicate add nahi hone diya

            const updatedUsers = [...state.group.groupList, user]
            return {
                group: {
                    ...state.group,
                    groupList: updatedUsers,
                    totalUsers: updatedUsers.length,
                },
            }
        }),
    

    // user ke padd add icon ko click kr ke add hoga agar 2 baar kr dia toh 2 time remove ho jayega     


    toggleUser: (user) => {
        const exists = get().group.groupList.some(
            (u) => u.userId === user.userId
        )
        if (exists) {
            get().removeUser(user.userId)
        } else {
            get().addUser(user)
        }
    },



    removeUser: (userId) =>
        set((state) => {
            const updatedUsers = state.group.groupList.filter(
                (u) => u.userId !== userId
            )
            return {
                group: {
                    ...state.group,
                    groupList: updatedUsers,
                    totalUsers: updatedUsers.length,
                },
            }
        }),


    reset: () => set({ group: initialGroup }),


}))