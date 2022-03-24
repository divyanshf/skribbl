import React, { useState, createContext } from 'react'

export const GuessListContext = createContext()

export const GuessListProvider = (props) => {
    const [guessList, setGuessList] = useState([])

    return (
        <GuessListContext.Provider value={[guessList, setGuessList]}>
            {props.children}
        </GuessListContext.Provider>
    );
}