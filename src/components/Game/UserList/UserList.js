import './UserList.css'
import UserCard from './UserCard/UserCard'

function UserList({users, user, drawerId}){
    return (
        <div className='scores-container'>
            {users.map((u, index) => <UserCard key={index} index={index} user={u} details={user} drawerId={drawerId}/> )}
        </div>
    );
}

export default UserList