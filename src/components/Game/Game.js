import './Game.css'
import {useState, useEffect, useRef, useContext} from 'react'
import Title from '../Title/Title'
import UserList from './UserList/UserList'
import GuessContainer from './GuessContainer/GuessContainer'
import ScoreBoard from './ScoreBoard/ScoreBoard'
import Canvas from './Canvas/Canvas'
import Options from './Options/Options'
import {drawBackground, drawLine, clearCanvas, eraseCanvas} from './Canvas/Functions/Functions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEraser, faPencilAlt, faTrash, faClock } from '@fortawesome/free-solid-svg-icons'
import Colors from './Colors'
import { UsersContext } from '../../context/UsersContext'
import { UserContext } from '../../context/UserContext'
import { GuessListContext } from '../../context/GuessListContext'

function Game (props) {

    const {socketRef, wait, setWait} = props
    const [users, setUsers] = useContext(UsersContext)
    const [user, setUser] = useContext(UserContext)
    const [finalScores, setFinalScores] = useState([])
    const [scoredUsers, setScoredUsers] = useState([])
    const [canvasStatus, setCanvasStatus] = useState('canvas')
    // const [turnEnd, setTurnEnd] = useState(false)
    // const [endgame, setEndgame] = useState([])
    const [drawerId, setDrawerId] = useState('')
    const [drawing, setDrawing] = useState([])
    const [words, setWords] = useState([])
    const [word, setWord] = useState('_')
    const [time, setTime] = useState('-')
    const [rounds, setRounds] = useState(0)
    const [totalRounds, setTotalRounds] = useState(0)
    const [editOption, setEditOption] = useState('edit')
    const [canvas, setCanvas] = useState(null)
    const [color, setColor] = useState(Colors[0])
    const canvasParent = useRef(null)
    const [guessList, setGuessList] = useContext(GuessListContext)

    useEffect(() => {
        socketRef.current.emit('joined', user.username)

        //  When a user joins
        socketRef.current.on('addUser', (u) => {
            setUsers(prev => {
                return [...prev, u]
            })
        })

        //  Wait
        socketRef.current.on('wait', (val) => {
            setWait(val)
        })

        //  Update the score
        socketRef.current.on('updateScore', (u) => {
            setUsers(prev => {
                return prev.map((el) => el.id === u.id ? u : el)
            })
        })

        //  A guess is made
        socketRef.current.on('guess', (g) => {
            setGuessList(prev => [...prev, g])
        })
        
        //  Choose a word
        socketRef.current.on('chooseWord', (words)=>{
            setWords(words)
            setCanvasStatus('words')
            setFinalScores([])
        })

        //  On drawing
        socketRef.current.on('drawing', ({drawing}) => {
            setDrawing(drawing)
        })

        //  Timer
        socketRef.current.on('timer', (counter)=>{
            setTime(counter)
        })
        socketRef.current.on('end', (scoredUsers)=>{
            setCanvasStatus('end')
            // setTurnEnd(true)
            setScoredUsers(scoredUsers)
            setDrawing([])
            setTime('-')
        })

        //  Rounds
        socketRef.current.on('total-rounds', (totalRounds)=>{
            setTotalRounds(totalRounds)
        })
        socketRef.current.on('rounds', (round) => {
            setRounds(round)
        })
        socketRef.current.on('endgame', (allUsers) => {
            setFinalScores(allUsers.sort((a, b)=>{
                return a.score >= b.score ? -1 : 1
            }))
            setCanvasStatus('endgame')
        })

        //  Reset scores
        socketRef.current.on('reset', ()=>{
            //  Set scores to zero
            setUsers(prev => {
                return prev.map(el => {
                    return {
                        ...el,
                        score:0
                    }
                })
            })

            setTime('-')
       
            //  Set the guess list empty
            setGuessList([])
        })
        
        //  Drawer index
        socketRef.current.on('drawer', ({id, newWord})=>{
            setDrawerId(id)
            setWord(newWord)
            setScoredUsers([])
            setCanvasStatus('canvas')
            // setTurnEnd(false)
        })

        //  When a user leaves
        socketRef.current.on('removeUser', (u) => {
            setUsers(prev => {
                return prev.filter((el) => el.id !== u.id)
            })
        })
    }, [])

    //  Change handlers
    const getUnknownWord = () => {
        let size = word.length
        let unknown = ''
        for(let i = 0; i < size; i++){
            if(word[i] === '-' || word[i] === ' ')
                unknown += word[i]
            else
                unknown += '_'
        }
        if(unknown === '_' || unknown === ''){
            return '_'
        }
        return unknown
    }

    //  Options handler
    const handleClear = (e) => {
        if(socketRef.current.id === drawerId){
            clearCanvas(canvas.getContext('2d'), canvas)
            setDrawing([])
            socketRef.current.emit('clear')
        }
    }

    const handleWordSubmit = (w) => {
        socketRef.current.emit('chooseWord', w)
        setWords([])
    }

    const handleEditOption = () => {
        setEditOption('edit')
    }

    const handleEraseOption = () => {
        setEditOption('erase')
    }

    const handleColorChange = (e) => {
        setColor(e)
    }

    const options = [
        {
            name:'edit',
            icon:faPencilAlt,
            handler:handleEditOption
        },
        {
            name:'erase',
            icon:faEraser,
            handler:handleEraseOption
        },
        {
            name:'clear',
            icon:faTrash,
            handler:handleClear
        }
    ]

    //  Render functions
    const renderOptions = () => {
        return(
            <Options options={options} color={color} editOption={editOption} handleColorChange={handleColorChange} />
        );
    }

    const renderScoreBoard = () => {
        return (
            <ScoreBoard users={users} scoredUsers={scoredUsers} word={word} />
        );
    }

    const renderCanvas = () => {
        return (
            <Canvas canvasParent={canvasParent} socketRef={socketRef} drawing={drawing} setDrawing={setDrawing} drawerId={drawerId} drawBackground={drawBackground} drawLine={drawLine} clearCanvas={clearCanvas} eraseCanvas={eraseCanvas} setCanvas={setCanvas} editOption={editOption} color={color} time={time} />
        );
    }

    const renderWordOptions = () => {
        return (
            <div className="canvas-options-outer-container">
                <h3>Choose a word !</h3>
                <div className="word-options-container">
                    {words.map((w, index) => <button key={index} className="word-option" onClick={()=>handleWordSubmit(w)} > {w} </button>)}
                </div>
            </div>
        );
    }

    const renderFinalScoreCard = (u, index) => {
        return (
            <div key={index} className="card-flexed">
                <h3> # {index + 1} </h3>
                <h3> {u.username} </h3>
                <h3> {u.score} </h3>
            </div>
        );
    }

    const renderFinalScores = () => {
        return (
            <div className="canvas-options-outer-container">
                {finalScores.map((u, index) => renderFinalScoreCard(u, index))}
            </div>
        );
    }

    const renderCanvasStatus = () => {
        switch (canvasStatus) {
            case 'words':
                return renderWordOptions()
            case 'canvas':
                return renderCanvas()
            case 'end':
                return renderScoreBoard()
            case 'endgame':
                return renderFinalScores()
            default:
                break;
        }
    }

    if(wait){
        return (
            <div className="outer-container center-wait">
                <h1 className="wait">Waiting for users to join</h1>
            </div>
        );
    }
    else
    return (
        <div className="outer-container">
            <nav>
                <Title size='3rem' stroke='2px' align='left' />
            </nav>
            <div className="word-bar">
                <div className="rounds-info-container">
                    <h1 className="timer"> <FontAwesomeIcon icon={faClock} /> {time} s </h1>
                    <h1 className="rounds"> {rounds} / {totalRounds} </h1>
                </div>
                <h1 className="word"> {socketRef.current.id === drawerId ? word : getUnknownWord()} </h1>
            </div>
            <div className="canvas-outer-container">

                <UserList users={users} user={user} drawerId={drawerId} />
                
                <div ref={canvasParent} className="canvas-container">
                    { renderCanvasStatus() }
                </div>

                <GuessContainer socketRef={socketRef} />

            </div>
            {renderOptions()}
        </div>
    );

}

export default Game