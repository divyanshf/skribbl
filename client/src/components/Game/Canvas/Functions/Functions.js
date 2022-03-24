let strokeColor = 'black'

export const drawBackground = (context, canvas) => {
    if(context){
        context.fillStyle='white'
        context.fillRect(0, 0, canvas.width, canvas.height)
    }
}

export const drawLine = (context, canvas, color, initial, final) => {
    if(context){
        if(final){
            context.beginPath()
            context.lineWidth = 6
            context.lineCap = 'round'
            context.lineJoin = 'round'
            context.strokeStyle = color
            context.moveTo(initial.x, initial.y)
            context.lineTo(final.x, final.y)
            context.stroke()
            context.closePath()
        }
        else{
            context.fillStyle = color
            context.fillRect(initial.x - 4, initial.y - 4, 6, 6)
        }
    }
}

export const clearCanvas = (context, canvas) => {
    if(context){
        context.clearRect(0, 0, canvas.width, canvas.height)
        drawBackground(context, canvas)
        window.sessionStorage.removeItem('drawing')
    }
}

export const eraseCanvas = (context, canvas, color, initial, final) => {
    if(context){
        if(final){
            context.beginPath()
            context.strokeStyle = 'white'
            context.lineWidth = 10
            context.lineCap = 'round'
            context.lineJoin = 'round'
            context.moveTo(initial.x, initial.y)
            context.lineTo(final.x, final.y)
            context.stroke()
            context.closePath()
        }
        else{
            context.fillStyle = 'white'
            context.fillRect(initial.x - 5, initial.y - 5, 10, 10)
        }
        // socket.emit('draw', {initial, final})
        window.sessionStorage.setItem('drawing', canvas.toDataURL('image/svg'))
    }
}

export default strokeColor