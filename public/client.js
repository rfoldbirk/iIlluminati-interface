const log = console.log
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext("2d")

const socket = io('ws://localhost:3000')


socket.on('INFO', msg => {
    log(' ->', msg)
})


socket.on('connect', () => {
    
})


socket.on('set_uuid', uuid => {
    localStorage.setItem('uuid', uuid)
    log('INFO: uuid has been stored')
})

socket.on('uuid?', override => {
    log('INFO: uuid?')
    let uuid = localStorage.getItem('uuid')
    if (uuid && !override) {
        log(' -> loggin in')
        socket.emit('login', uuid)
    }
    else {
        log(' -> registering')
        socket.emit('register')
    }
})

// handle the event sent with socket.send()
socket.on('game-info', data => {
    console.log(data)
})



function set_name(name) {
    socket.emit('set_name', name)
}

function save() {
    socket.emit('save')
}


function reset() {
    socket.emit('reset')
}


function new_game() {
    socket.emit('new_game')
}



function setSize() {
    canvas.width = screen.width
    canvas.height = screen.height
    ctx.fillStyle = "lightblue"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
}

setSize()
document.addEventListener('resize', setSize)