import './Join.css'
import {useState, useContext} from 'react'
import Title from '../Title/Title'
import { UsersContext } from '../../context/UsersContext'
import { UserContext } from '../../context/UserContext'

function Join (props) {
    const {setGame, socketRef, wait, setWait} = props
    const [user, setUser] = useContext(UserContext)
    const [users, setUsers] = useContext(UsersContext)
    const [error, setError] = useState('')

    //  Audio
    const playAudio = () => {
        let audio = new Audio(process.env.PUBLIC_URL + '/sounds/join.ogg')
        audio.play()
    }

    //  Handle input change
    const handleChange = (e) => {
        let {name, value} = e.target
        setUser(prev => {
            return {
                ...prev,
                [name]:value
            }
        })
    }

    const handleSubmit = (e) => {
        if(user.username !== ''){
            //  Everything is fine
            socketRef.current.emit('join', user, (result)=>{
                if(result.error){
                    setError(result.error)
                }
                else{
                    setError('')
                    setGame(true)
                    setUsers(result.allUsers)
                    playAudio(true)
                }
            })
        }
        else{
            setError('Fill up the details!')
        }
    }

    //  Render functions
    const renderError = () => {
        return (
            <p id="error">
                {error}
            </p>
        );
    }

    return (
        <div className='outer-container'>
            <Title size='15vw' stroke='0.4vw' align='center' />
            <div className="form-container">
                <div id="login-form">
                    <input id="username" autoComplete="off" className="mt-10" type="text" placeholder="Username" name="username" onChange={handleChange} onKeyPress={(e) => e.code === 'Enter' ? handleSubmit(e) : null} value={user.username} />
                    <button id="play" className="mt-10" onClick={handleSubmit}>Join</button>
                    {error ? renderError() : null}
                </div>
            </div>
        </div>
    );
}

export default Join