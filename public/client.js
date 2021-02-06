const log = console.log
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext("2d")

const socket = io('ws://localhost:3000')


function client_log(message) {
    log('%cCLI: %c' + message, "color: yellow", "color: default")
}




function set_canvas_size() {
    canvas.width = screen.width
    canvas.height = screen.height
    ctx.fillStyle = "lightblue"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

set_canvas_size()
document.addEventListener('resize', set_canvas_size)