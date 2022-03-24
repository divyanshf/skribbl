import './UserCard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons'

function UserCard(props){

    const {user, details, drawerId} = props

    const getName = () => {
        return user.username + (details.username === user.username ? ' (You)' : '')
    }

    return(
        <div className="card-container">
            <h3 id="user-name">{getName()}</h3>
            {user.id === drawerId ? <FontAwesomeIcon icon={faPencilAlt} /> : null}
            <h3 id="user-score">{user.score}</h3>
        </div>
    );
}

export default UserCard

// #A9FF83