import { useState, useRef, useEffect, useContext } from 'react'
import { GuessListContext } from '../../../context/GuessListContext'
import './GuessContainer.css'

function GuessContainer({socketRef}){
    const [guess, setGuess] = useState('')
    const [guessList, setGuessList] = useContext(GuessListContext)
    const guessListRef = useRef(null)

    useEffect(() => {
        if(guessListRef.current)
            guessListRef.current.scrollTop = guessListRef.current.scrollHeight
    }, [guessList])

    const handleGuessChange = (e) => {
        setGuess(e.target.value.toLowerCase())
    }
    const handleGuessSubmit = (e) => {
        if(e.code === "Enter" && guess.length > 0 && guess.trim().length > 0) {
            socketRef.current.emit('guess', guess.trim())
            setGuess('')
        }
    }

    const renderGuess = (g, key) => {
        let back = key % 2===0 ? '#E8E8E8' : '#C8C8C8'
        return (
            <p key={key} style={{
                color:`${g.color}`,
                backgroundColor: back,
                margin:'0',
                padding: '10px',
                overflowWrap: 'break-word',
                transition: '0.5s ease'
            }}> {g.sender ? renderSpan(g.sender) : null} <span>{g.message}</span> </p>
        )
    }
    
    const renderSpan = (msg) => {
        return (
            <span style={{
                fontWeight:'800'
            }}> {msg} : </span>
        )
    }

    return (
        <div className="guess-container">
            <div ref={guessListRef} className="guess-list">
                {guessList.map(renderGuess)}
            </div>
            <div className="input-container">
                <input className="guess-input" type="text" placeholder="Type your guess ..." onChange={handleGuessChange} onKeyPress={handleGuessSubmit} value={guess} />
            </div>
        </div>
    );
}

export default GuessContainer