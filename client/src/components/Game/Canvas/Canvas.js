import './Canvas.css'
import {useRef, useEffect} from 'react'

function Canvas(props){

    const {socketRef, drawerId, drawing, setDrawing, canvasParent, drawBackground, drawLine, clearCanvas, eraseCanvas, setCanvas, editOption, color} = props
    const canvasRef = useRef(null)
    const editOptionRef = useRef(editOption)
    const colorRef = useRef(color)
    let mousedown = undefined

    //  Main useeffect
    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')

        setCanvas(canvas)

        if(canvasParent.current){
            let parentWidth = canvasParent.current.clientWidth
            let parentHeight = canvasParent.current.clientHeight
            let smaller = parentWidth < parentHeight ? parentWidth : parentHeight
            canvas.width = smaller
            canvas.height = smaller
        }
        drawBackground(ctx, canvas)


        //  Sockets
        socketRef.current.on('draw', ({color, mousedown, mousemove}) => {
            drawLine(ctx, canvas, color, mousedown, mousemove)
        })

        socketRef.current.on('erase', ({mousedown, mousemove}) => {
            eraseCanvas(ctx, canvas, 'white', mousedown, mousemove)
        })

        socketRef.current.on('clear', ()=>{
            clearCanvas(ctx, canvas)
            setDrawing([])
        })

        socketRef.current.on('drawData', ({x1, y1, x2, y2, color}) => {
            const data = {
                initial:{
                    x: x1,
                    y: y1
                },
                final:{
                    x: x2,
                    y: y2
                },
                color: color
            }
            setDrawing(prev => [...prev, data])
        })

    }, [socketRef])

    //  Drawerid useeffect
    useEffect(() => {
        if(socketRef.current.id === drawerId){
            setEventListeners(canvasRef.current, canvasRef.current.getContext('2d'))
            canvasRef.current.style.touchAction = 'none'
        }
    }, [socketRef, drawerId])

    //  Color / Edit Option change useEffect
    useEffect(() => {
        colorRef.current = color
        editOptionRef.current = editOption
    }, [color, editOption])

    //  On drawing
    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        drawImage(ctx, canvas)

        window.addEventListener('resize', (e)=>{
            if(canvasParent.current){
                let parentWidth = canvasParent.current.clientWidth
                let parentHeight = canvasParent.current.clientHeight
                let smaller = parentWidth < parentHeight ? parentWidth : parentHeight
                canvas.width = smaller
                canvas.height = smaller
            }
            drawBackground(canvas.getContext('2d'), canvas)
            drawImage(canvas.getContext('2d'), canvas)
        })
    }, [drawing])

    //  Draw complete
    const drawImage = (ctx, canvas) => {
        clearCanvas(ctx, canvas)
        drawing.forEach(element => {
            const initial = {
                x: element.initial.x * canvas.width,
                y: element.initial.y * canvas.height
            }
            const final = {
                x: element.final.x * canvas.width,
                y: element.final.y * canvas.height
            }
            if(final.x && final.y){
                drawLine(ctx, canvas, element.color, initial, final)
            }
            else{
                drawLine(ctx, canvas, element.color, initial)
            }
        });
    }

    //  Set and remove pointer event listeners
    const setEventListeners = (canvas, context) => {
        canvas.addEventListener('pointerdown', e => mouseDownHandler(e, context))
        canvas.addEventListener('pointermove', e => mouseMoveHandler(e, context))
        canvas.addEventListener('pointerup', e => mouseUpHandler(e, context))
        canvas.addEventListener('pointerleave', e => mouseUpHandler(e, context))
        canvas.addEventListener('pointercancel', e => mouseUpHandler(e, context))
    }
    // const removeListeners = (canvas, context) => {
    //     canvas.removeEventListener('pointerdown', e => mouseDownHandler(e, context))
    //     canvas.removeEventListener('pointermove', e => mouseMoveHandler(e, context))
    //     canvas.removeEventListener('pointerup', e => mouseUpHandler(e, context))
    //     canvas.removeEventListener('pointerleave', e => mouseUpHandler(e, context))
    //     canvas.removeEventListener('pointercancel', e => mouseUpHandler(e, context))
    // }

    //  Event handlers
    const mouseMoveHandler = (e, context) => {
        if(mousedown){
            let mousemove = {
                x: e.offsetX,
                y: e.offsetY
            }
            const canvas = canvasRef.current
            // draw line
            if(editOptionRef.current === 'edit'){
                // drawLine(context, canvas, colorRef.current, mousedown, mousemove)
                const data = {
                    initial:{
                        x: mousedown.x / canvas.width,
                        y: mousedown.y / canvas.height
                    },
                    final:{
                        x:mousemove.x / canvas.width,
                        y:mousemove.y / canvas.height
                    },
                    color: colorRef.current
                }
                setDrawing(prev => [...prev, data])
                socketRef.current.emit('drawData', {
                    x1 : data.initial.x,
                    y1 : data.initial.y,
                    x2 : data.final.x,
                    y2 : data.final.y,
                    color: colorRef.current,
                })
            }
            else{
                // drawLine(context, canvasRef.current, 'white', mousedown, mousemove)
                const data = {
                    initial:{
                        x: mousedown.x / canvas.width,
                        y: mousedown.y / canvas.height
                    },
                    final:{
                        x:mousemove.x / canvas.width,
                        y:mousemove.y / canvas.height
                    },
                    color: 'white'
                }
                setDrawing(prev => [...prev, data])
                socketRef.current.emit('drawData', {
                    x1 : data.initial.x,
                    y1 : data.initial.y,
                    x2 : data.final.x,
                    y2 : data.final.y,
                    color: 'white',
                })
            }

            mousedown = mousemove
        }
    }
    const mouseDownHandler = (e, context) => {
        mousedown = {
            x: e.offsetX,
            y: e.offsetY,
        }
        const canvas = canvasRef.current
        if(editOptionRef.current === 'edit'){
            // drawLine(context, canvas, colorRef.current, mousedown)
            const data = {
                initial:{
                    x: mousedown.x / canvas.width,
                    y: mousedown.y / canvas.height
                },
                final:{},
                color: colorRef.current
            }
            setDrawing(prev => [...prev, data])
            socketRef.current.emit('drawData', {
                x1 : data.initial.x,
                y1 : data.initial.y,
                color: colorRef.current,
            })
        }
        else{
            // drawLine(context, canvasRef.current, 'white', mousedown)
            const data = {
                initial:{
                    x: mousedown.x / canvas.width,
                    y: mousedown.y / canvas.height
                },
                final:{},
                color: 'white'
            }
            setDrawing(prev => [...prev, data])
            socketRef.current.emit('drawData', {
                x1 : data.initial.x,
                y1 : data.initial.y,
                color: 'white',
            })
        }
    }
    const mouseUpHandler = (e, context) => {
        mousedown = undefined;
    }

    //  Render
    return (
        <canvas ref={canvasRef} id='canvas' style={{
            cursor: 'url(./Cursor/edit5.svg) 5 5, crosshair'
        }} />
    );
}

export default Canvas