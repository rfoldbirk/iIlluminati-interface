const { clear, log } = console; clear()

const warn = (msg) => log('\x1b[33m%s\x1b[0m', `WARNING: ${ msg }`)

const { readFileSync, writeFileSync } = require('fs')
const Funcs = new require('./helper.js')

// Biblioteker
var express = require('express')
var app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

// Egne biblioteker
var Games = []
var Players = []

var Game = require('./game.js')
var Player = require('./players.js')




app.use(express.static('public'))


io.on('connection', (socket) => {
	const sid = socket.id
	let this_player // En kopi af spilleren.
	
	socket.emit('uuid?') 
	// Beder brugeren om at oplyse sit uuid, som basically logger brugeren ind
	// Hvis uuid'et er ugyldigt bliver en ny bruger tildelt.



	// -------------------------------------------------------------------------------
	// --                           SOCKET.IO API CALLS 							--
	// -------------------------------------------------------------------------------


	// Player relaterede funktioner --------------------------------------------------

	socket.on('list_players', ()  => {
		log(' -> list of players')
		let array_of_players = 'En liste over alle spillere: \n'
		for (let player of Players) {
			array_of_players += (`${player.name} - ${player.uuid} - GID: ${player.game_id} \n`)
		}
		socket.emit('INFO', array_of_players)
	})


	socket.on('register', () => {
		this_player = new Player(sid)
		Players.push( this_player )

		socket.emit('set_uuid', this_player.uuid)
	})


	socket.on('login', uuid => {
		for (const P of Players) {
			if (P.uuid == uuid)
				this_player = P
		}

		if (!this_player) {
			socket.emit('uuid?', true)
		}
		else {
			log(' -> user: "' + this_player.name + '" loggede ind')

			this_player.last_login = new Date().getTime()
		}
	})


	socket.on('set_name', name => {
		// Navnet bør starte med stort begyndelsesbogstav
		let a = name.slice(0, 1)
		let b = name.slice(1, name.length)
		name = a.toUpperCase() + b

		this_player.name = name
		socket.emit('INFO', 'Nyt kælenavn: ' + name)
	})


	// Game relaterede funktioner ----------------------------------------------------

	socket.on('new_game', (data) => {
		if (this_player.can_join_game()) {
			let new_game = new Game(this_player.uuid)
			Games.push(new_game)

			socket.emit('INFO', `Oprettede et spil med id: ${new_game.id}`)
			socket.emit('INFO', `GID: ${new_game.id} har ikke noget kodeord`)

		} else {
			socket.emit('INFO', 'Du er allerede i gang med et spil!')
		}
	})


	socket.on('join_game', (game_id, optional_password) => {
		if (this_player.can_join_game()) {
			let game = find_game(game_id)
			if (!game) {
				socket.emit('ERR', 'Kunne ikke finde matchende spil')
				return
			}

			
			let response = game.join(this_player.uuid, optional_password)
			let msgType = (response.res) ? 'INFO':'ERR'
			socket.emit(msgType, response.info)

			if (response.res) {
				this_player.join_game(game_id)
			}
		}
		else {
			socket.emit('INFO', 'Allerede medlem af en gruppe')
		}
	})


	socket.on('leave_game', () => {
		let game = find_game(this_player.game_id)
		if (!game) return

		this_player.leave_game()
		game.remove_player(this_player.uuid)
		socket.emit('INFO', 'Forlod gruppe')
	})


	socket.on('set_game_password', (password) => {
		let game = find_game(this_player.game_id)
		if (!game) {
			socket.emit('ERR', 'Kunne ikke finde matchende spil')
			return
		}

		let response = game.set_password(this_player.uuid, password)
		if (response)
			socket.emit(response.info)
	})



	// Andet -------------------------------------------------------------------------

	socket.on('reset', () => {
		Players = []
		Games = []
	})


	socket.on('save', () => {
		save()
		socket.emit('INFO', 'Spil gemt!')
	})	
})


http.listen(3000, () => {
	let choosen_port // default er 3000
	let choose_this = false
	for (let arg of process.argv) {
		if (arg == '-p' || arg == '--port') {
			choose_this = true
		}
		else if (choose_this && !choosen_port) {
			choose_this = false

			try {
				let port_to_number = Number(arg)
				if (typeof port_to_number == 'number') {
					choosen_port = port_to_number
				}
			} catch (err) {
				// ingenting
			}
		}
		else if (choose_this) {
			warn('Multiple port settings!')
		}
	}
	choosen_port = choosen_port || 3000

	log(`Illuminati Money Server on *:${choosen_port}`)
})



function find_game(game_id) {
	for (let game of Games) {
		if (game.id == game_id) return game
	}

	return false
}


// LOAD & SAVE

const filename = 'serialized_dump.json'

function load() {
	try {
		let data = JSON.parse(readFileSync(filename))
		if (data) {
			let arrays = Object.keys(data)

			for (let arr of arrays) {
				let this_arr = data[arr]

				for (let obj of this_arr) {
					let new_obj
					if (arr == 'Games') {
						new_obj = new Game
					}
					else if (arr == 'Players') {
						new_obj = new Player
					}

					for (let key of Object.keys(new_obj)) {
						new_obj[key] = obj[key]
					}

					if (arr == 'Games') {
						Games.push(new_obj)
					}
					else if (arr == 'Players') {
						Players.push(new_obj)
					}
				}
			}
		}
	} catch (err) {
		save()
	}
	let data = JSON.parse(readFileSync(filename))
}

function save() {
	writeFileSync(filename, JSON.stringify({
		'Players': Players,
		'Games': Games
	}, 0, 4, true))
}

load()




process.stdin.resume()

function exitHandler(options, exitCode) {
	save()

    if (options.cleanup) console.log('clean')
    if (exitCode || exitCode === 0) console.log(exitCode)
    if (options.exit) process.exit()
}

//do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}))

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {exit:true}))

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, {exit:true}))
process.on('SIGUSR2', exitHandler.bind(null, {exit:true}))

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {exit:true}))

