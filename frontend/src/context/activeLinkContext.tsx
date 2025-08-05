import {  createContext, useContext, useState, type ReactNode } from "react"


type ActiveLink = {
    activeLink : string;
    updateActiveLink(path : string) : void;
}


const ActiveLinkContext = createContext<ActiveLink | undefined>(undefined);

export const ActiveLinkProvider = ({children} : {children : ReactNode}) => {
    
    const [activeLink, setActiveLink] = useState('/');

    const updateActiveLink = (path : string) => setActiveLink(path);

    return (
        <ActiveLinkContext.Provider value = {{activeLink, updateActiveLink}}>
            {children}
        </ActiveLinkContext.Provider>
    )
}

export const useActiveLink = () => {
    const context = useContext(ActiveLinkContext);

    if(!context)
        throw new Error("useActiveLink should be used on ActiveLinkProvider");
    return context;
}
