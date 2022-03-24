const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const cors = require('cors')
const wordsJson = require('./config/words')

//  Game
const Game = require('./config/game')
const game = new Game(wordsJson)

//  Port
const PORT = process.env.PORT || 5000

//  App
const app = express()
app.use(express.static(`${__dirname}/client`))
app.use(cors)

//  Server and socket io
const server = http.createServer(app)
const io = socketio(server)
let interval;

//  IO connection
io.on('connect', (socket)=>{

    //  Timer
    const runTimer = () => {
        var counter = 120
        interval = setInterval(() => {
            //  Notify client
            io.emit('timer', counter)
            //  Time's up
            if(counter === 0){
                clearInterval(interval)
                io.emit('end', game.guessedUsers)
                io.emit('guess', {message:`The word was ${game.word}`, color:'green'})
                game.resetGuessedUsers()

                checkRounds()
            }
            counter--
        }, 1000);
    }

    //  Check for rounds
    const checkRounds = () => {

        //  If everyone has drawn
        if(game.drawnUsers.length === game.users.length){
            game.rounds += 1
            if(game.rounds < game.totalRounds){
                io.emit('rounds', game.rounds + 1)
            }
            game.resetDrawnUsers()
        }

        //  If all the rounds are done
        if(game.rounds === game.totalRounds){
            io.emit('reset')
            io.emit('endgame', game.getAllUsers())
            game.endgame = true

            game.rounds = 0
            setTimeout(() => {
                game.endgame = false
                io.emit('rounds', game.rounds + 1)
                changeTurn()
            }, 5000);
        }
        else{
            game.word = ''
            changeTurn(3)
        }
    }

    const changeTurn = (time = 3) => {
        //  Reset drawing
        game.resetDrawing()
        //  Choose new drawer and words
        const {drawer, words} = game.start()
        game.addDrawnUser(drawer)
        //  Start new turn
        setTimeout(() => {
            io.emit('guess', {message:`${drawer.username} is choosing a word now!`, color:'brown'})
            io.to(drawer.id).emit('chooseWord', words)
        }, time * 1000);
    }

    //  Join a user
    socket.on('join', ({username}, callback)=>{
        const {error, user} = game.addUser(socket.id, username)
        
        if(error){
            return callback({error})
        }

        //  Notify clients
        socket.broadcast.emit('addUser', user)

        const allUsers = game.getAllUsers()
        callback({allUsers})
    })

    //  When the game component is on
    socket.on('joined', (username)=>{
        io.emit("guess", {message:`${username} has joined.`, color:'blue'})
        io.emit('total-rounds', game.totalRounds)

        const allUsers = game.getAllUsers()

        if(allUsers.length >= 2){
            io.emit('wait', false)

            io.emit('rounds', game.rounds + 1)
            
            //  If a game is on
            if(game.game){
                const drawer = game.getUser(game.drawerId)
                if(game.word !== ''){
                    socket.emit('guess', {message:`${drawer.username} is drawing now!`, color:'purple'})
                    socket.emit('drawing', {drawing:game.drawing})
                    socket.emit('drawer', {id:game.drawerId, newWord:game.word})
                }
                else{
                    socket.emit('guess', {message:`${drawer.username} is choosing a word now!`, color:'brown'})
                }
            }

            //  If a game is off
            else{
                changeTurn(0)
            }
        }
        else{
            io.emit('wait', true)
            game.game = false
        }

    })

    //  Drawing
    socket.on('clear', ()=>{
        socket.broadcast.emit('clear')
        game.resetDrawing()
    })
    socket.on('drawData', ({x1, y1, x2, y2, color}) => {
        socket.broadcast.emit('drawData', {x1, y1, x2, y2, color})
        game.addDrawData({x:x1, y:y1}, {x:x2, y:y2}, color)
    })

    //  When drawer chooses a word
    socket.on('chooseWord', (word)=>{
        game.word = word

        const drawer = game.getUser(game.drawerId)
        
        io.emit('drawer', {id:game.drawerId, newWord:word})
        io.emit('guess', {message:`${drawer.username} is drawing now!`, color:'purple'})
        
        runTimer()
    })

    //  User makes a guess
    socket.on('guess', (guess) => {
        const user =  game.getUser(socket.id)

        if(socket.id !== game.drawerId){
            const index = game.guessedUsers.findIndex((u) => u.id === socket.id)

            //  Already guessed the word
            if(index != -1){
                io.emit("guess", {sender: user.username, message: guess, color:'green'})
                return
            }

            //  Guessed the word
            if(guess.toLowerCase() === game.word.toLowerCase()){
                const {error} = game.addGuessedUser(user)
                if(error){
                    io.emit("guess", {sender: user.username, message: guess, color:'green'})
                }
                else{
                    game.updateScore(user.id, user.score + 100)
                    io.emit("guess", {message:`${user.username} guessed the word.`, color:'green'})
                    io.emit('updateScore', user)

                    //  If all have guessed
                    if(game.guessedUsers.length === game.users.length - 1){
                        clearInterval(interval)
                        io.emit('end', game.guessedUsers)
                        io.emit('guess', {message:`The word was ${game.word}`, color:'green'})
                        game.game = false
                        game.word = ''
                        game.resetGuessedUsers()
                        game.resetDrawing()

                        checkRounds()
                    }
                }
            }
            else{
                if(guess.length === game.word.length){
                    let misMatch = 0
                    for(let i = 0; i < game.word.length; i++){
                        if(guess[i].toLowerCase() !== game.word[i].toLowerCase()){
                            misMatch += 1
                        }
                    }
                    if(misMatch === 1){
                        socket.broadcast.emit("guess", {sender:user.username ,message:guess, color:'black'})
                        socket.emit("guess", {sender:user.username ,message:guess, color:'black'})
                        socket.emit("guess", {message:`${guess} is close`, color:'green'})
                    }
                    else{
                        io.emit("guess", {sender:user.username ,message:guess, color:'black'})
                    }
                }
                else{
                    io.emit("guess", {sender:user.username ,message:guess, color:'black'})
                }
            }
        }
        
        else{
            io.emit("guess", {sender:user.username ,message:guess, color:'black'})
        }
    })

    //  On user disconnect
    socket.on('disconnect', () => {
        const user = game.getUser(socket.id)
        if(user){
            socket.broadcast.emit('removeUser', user)
            io.emit('guess', {message:`${user.username} left.`, color:'red'})
            const allUsers = game.getAllUsers()
            if(allUsers.length <= 2){
                io.emit('wait', true)
                game.rounds = 0
                game.game = false
                game.reset()
                game.word = ''
                clearInterval(interval)
                game.resetGuessedUsers()
                io.emit('reset')
                io.emit('clear')
            }
            else if(user.id === game.drawerId){
                io.emit('clear')
                game.removeDrawnUser(user.id)
                clearInterval(interval)

                if(game.word !== ''){
                    io.emit('guess', {message:`The word was ${game.word}!`, color:'green'})
                }

                checkRounds()

                if(game.endgame === false){
                    io.emit('end', game.guessedUsers)
                    game.word = ''
                    game.game = false
                    game.resetGuessedUsers()
                }
            }
            game.removeUser(socket.id)
            game.resetDrawing()

            //  Check if all have guessed
            if(game.users.length >= 2 && game.guessedUsers.length === game.users.length - 1){
                clearInterval(interval)

                if(game.endgame === false){
                    io.emit('end', game.guessedUsers)
                    game.game = false
                    io.emit('guess', {message:`The word was ${game.word}`, color:'green'})
                    game.word = ''
                    game.resetGuessedUsers()

                    checkRounds()
                }
            }
        }
    })
})

server.listen(PORT, ()=>{
    console.log('Server is running on ', PORT);
})