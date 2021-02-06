function set_name(name) {
    socket.emit('set_name', name)
}

function list_players() {
    socket.emit('list_players')
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

function join_game(game_id, password) {
    socket.emit('join_game', game_id, password)
}

function leave_game() {
    socket.emit('leave_game')
}

function set_game_password(password) {
    socket.emit('set_game_password', password)
}