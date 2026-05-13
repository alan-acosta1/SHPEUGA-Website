'use client'
import {createContext, useContext, useEffect, useState} from 'react';
import {createClient} from '@/utils/supabase/client';

const AuthContext = createContext<{role : string | null}>({role:null});

export function AuthProvider({children}: {children:React.ReactNode}){
    const [role, setRole] = useState<string | null>(null);

    useEffect(()=>{
        const fetchrole = async() =>{
            const supabase = createClient();
            const { data:{user}} = await supabase.auth.getUser()
            if(!user) return

            const {data} = await supabase
                .from('members')
                .select('role')
                .eq('user_id', user.id)
                .single()
            setRole(data?.role ?? null)

        }
        fetchrole();

    }, [])
    return <AuthContext.Provider value = {{role}}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext);