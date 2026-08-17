import {  useQueries, useQueryClient } from "@tanstack/react-query";
import { useEffect } from 'react'
import { UserList, GroupList } from "@/types/chalist";
import axios from "axios";

axios.defaults.withCredentials = true;

const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export function useUsersList() {
    const queryClient = useQueryClient()

    useEffect(() => {

        const es = new EventSource(`${API}/api/v1/users/stream`, {
            withCredentials: true
        })

        es.onopen = () => {
            
        }

        es.onmessage = (event) => {
       
            queryClient.invalidateQueries({ queryKey: ['chat-list'] })
        }

        es.onerror = (err) => {
            console.error('SSE error:', err)
        }

        return () => {
            es.close()
        }

    }, [queryClient])




    const [usersQuery, GroupQuery] = useQueries({     // array destructuring h  usequeries array return krta h and we are using 2 queuies 

        queries: [
            {
                queryKey: ['chat-list'],     // ye chache h 
                queryFn: async (): Promise<UserList[]> => {
                    const { data } = await axios.get(`${API}/api/v1/users/get`, {
                        withCredentials: true,
                    })

                   
                    return data.data
                },
                staleTime: 0,        // ✅ refetch when invalidated
                refetchOnMount: true,
                refetchOnWindowFocus: false,
            },

            {
                queryKey: ['my-groups'],
                queryFn:async (): Promise<GroupList[]> => {
                    const {data } =await axios.get(`${API}/api/v1/group/fetch_user`,{   // object destructuring 
                        withCredentials: true
                    })
                    return data.groups
                },
                staleTime: 0,        //  refetch when invalidated
                refetchOnMount: true,
                refetchOnWindowFocus: false,
            }
        ]
    })


    return {
        users: usersQuery.data ?? [],
        groups: GroupQuery.data ?? [],
        isLoading: usersQuery.isLoading || GroupQuery.isLoading,
        isError: usersQuery.isError || GroupQuery.isError,
    }
}
