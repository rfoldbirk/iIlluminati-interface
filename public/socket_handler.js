socket.on('INFO', msg => log('%cINFO: %c' + msg, "color: green", "color: default"))

socket.on('ERR', msg => log('%cERR: %c' + msg, "color: red", "color: default"))

socket.on('set_uuid', uuid => {
    localStorage.setItem('uuid', uuid)
    // client_log('uuid has been stored')
})

socket.on('uuid?', override => {
    // client_log('uuid?')
    let uuid = localStorage.getItem('uuid')
    if (uuid && !override) {
        // client_log('loggin in')
        socket.emit('login', uuid)
    }
    else {
        // client_log('registering')
        socket.emit('register')
    }
})

// handle the event sent with socket.send()
socket.on('game-info', data => {
    console.log(data)
})