import React, { useState, createContext } from 'react'

export const UserContext = createContext()

export const UserProvider = (props) => {
    const [user, setUser] = useState({
        id:'',
        username:'',
    })

    return (
        <UserContext.Provider value={[user, setUser]}>
            {props.children}
        </UserContext.Provider>
    );
}