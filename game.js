const Funcs = new require('./helper.js')



class Game {
    constructor() {
        this.id = Funcs.makeid()

        this.password = false

        this.members = []

        this.in_progress = false
    }

    set_password(psw) {
        psw = psw || Funcs.makeid(10)
        this.password = psw
    }
}


module.exports = Game