const { clear, log } = console
const { readFileSync, writeFileSync } = require('fs')

clear()

var Games = []
var Players = []

var Game = require('./game.js')
var Player = require('./players.js')


var express = require('express')

var app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

app.use(express.static('public'))


io.on('connection', (socket) => {
	const sid = socket.id

	let this_player
	
	socket.emit('uuid?')

	socket.on('login', uuid => {
		for (const P of Players) {
			if (P.uuid == uuid)
				this_player = P
		}

		if (!this_player) {
			socket.emit('uuid?', true)
		}
		else {
			log(' -> user: "' + this_player.name + '" logged in')
		}
			
	})

	socket.on('register', () => {
		log(' -> user registered')

		this_player = new Player(sid)
		Players.push( this_player )

		socket.emit('set_uuid', this_player.uuid)
	})

	socket.on('set_name', name => {
		this_player.name = name
	})


	socket.on('new_game', (data) => {
		if (this_player.can_join_game()) {
			let new_game = new Game

			socket.emit('INFO', `oprettede et spil med id: ${new_game.id}`)
			socket.emit('INFO', `GID: ${new_game.id} har ikke noget kodeord`)

		} else {
			socket.emit('INFO', 'Du er allerede i gang med et spil!')
		}
	})

	socket.on('join_game', game_id => {
		if (this_player.can_join_game()) {
			this_player.join_game(game_id)
			
		}
	})

	socket.on('reset', () => {
		Players = []
		Games = []
	})

	socket.on('save', () => {
		save()
		socket.emit('INFO', 'Saved!')
	})
})

http.listen(3000, () => {
	console.log('Illuminati Money Server on *:3000')
})



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

