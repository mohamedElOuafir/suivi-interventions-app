import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types/interfaces";

type Profile = {
    profile : User | null;
    updateProfile(user : User | null) : void;
}


const ProfileContext = createContext<Profile | undefined>(undefined);


export const ProfileProvider = ({children} : {children : ReactNode}) => {

    const [profile, setProfile] = useState<User | null>(null);

    const updateProfile = (currentUser : User | null) => setProfile(currentUser)

    return (
        <ProfileContext.Provider value={{profile, updateProfile}}>
            {children}
        </ProfileContext.Provider>
    )
}

export const useProfile = () => {
    const context = useContext(ProfileContext);

    if(!context) 
        throw new Error("useProfile should be used on ProfileProvider");

    return context;
}