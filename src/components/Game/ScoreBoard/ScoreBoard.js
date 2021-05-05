import './ScoreBoard.css'

function ScoreBoard({users, scoredUsers, word}){

    const renderScoreCard = (user, i) => {
        const index = scoredUsers.findIndex((u) => u === user.id)
        return (
            <div key={i} className="score-card">
                <h5> {user.username} </h5>
                <h5 style={{ color:'green' }}> {index === -1 ? 0 : 100} </h5>
            </div>
        );
    }

    return (
        <div className="score-board">
            <h3 className="scores"> The word was : {word} </h3>
            {users.map((u, index) => renderScoreCard(u, index))}
        </div>
    );
}

export default ScoreBoard