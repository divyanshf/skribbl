import {useState, useEffect, useRef, useContext} from 'react'
import io from 'socket.io-client'
import Join from './Join/Join'
import Game from './Game/Game'
import { GuessListProvider } from '../context/GuessListContext'

let socket;

function Home () {
    const ENDPOINT = 'https://skribbl-cloned.herokuapp.com/' || '127.0.0.1:5000'
    const [game, setGame] = useState(false)
    const [wait, setWait] = useState(true)
    const socketRef = useRef(null)

    useEffect(() => {
        socketRef.current = io(ENDPOINT, {transports:['websocket']})
    }, [ENDPOINT])

    return (
        <GuessListProvider>
            <div>
                {
                game ? 
                    <Game
                        socketRef={socketRef}
                        setWait={setWait}
                        wait={wait}
                    /> 
                    :
                    <Join
                        socketRef={socketRef}
                        wait={wait}
                        setGame={setGame}
                        setWait={setWait}
                    />
                }
            </div>
        </GuessListProvider>
    );
}

export default Home