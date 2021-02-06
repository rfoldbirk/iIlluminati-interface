const Funcs = require('./helper.js')



class Player {
    constructor(sid) {
        this.name = 'ikke navngivet'
        this.sid = sid
        this.uuid = Funcs.makeid()
        this.game_id = ''

        this.last_login = new Date().getTime()
    }


    join_game(game_id) {
        if (!this.can_join_game()) return false
        this.game_id = game_id
    }

    leave_game() {
        this.game_id = ''
    }

    can_join_game() {
        return (this.game_id == '')
    }
}



module.exports = Player
