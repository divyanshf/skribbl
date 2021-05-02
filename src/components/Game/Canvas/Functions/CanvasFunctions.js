class CanvasFunctions{
    constructor(canvas, context){
        this.canvas = canvas
        this.context = context
        this.strokeColor = 'black'
    }
}

CanvasFunctions.prototype.drawBackground = () => {
    if(this.context){
        this.context.fillStyle='white'
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
}

CanvasFunctions.prototype.drawPoint = (position) => {
    if(this.context){
        this.context.fillStyle='black'
        this.context.fillRect(position.x - 4, position.y - 4, 6, 6)
    }
}

CanvasFunctions.prototype.drawLine = (initial, final) => {
    if(this.context){
        this.context.strokeStyke = this.strokeColor
        this.context.lineWidth = 6
        this.context.lineCap = 'round'
        this.context.moveTo(initial.x, initial.y)
        this.context.lineTo(final.x, final.y)
        this.context.stroke()
        // socket.emit('draw', {initial, final})
        // window.localStorage.setItem('drawing', canvas.toDataURL('image/png'))
    }
}

CanvasFunctions.prototype.clearCanvas = () => {
    if(this.context){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.drawBackground()
        // window.localStorage.removeItem('drawing')
    }
}

export default CanvasFunctions