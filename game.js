const Funcs = new require('./helper.js')

class Card {
    constructor(income, parent, parent_direction, arr_children) {
        this.id = Funcs.makeid(64)

        this.income = income
        this.parent = parent
        this.parent_direction = parent_direction // 0 -> 3 : up, højre, ned, venstre
        this.children = arr_children || [] // skal være et array
    }
}

class Game {
    constructor(creator_uuid) {
        this.id = Funcs.makeid()

        this.password = false

        this.creator_uuid = creator_uuid
        this.members = []

        this.turn = ''
        this.phase = 'setup'
        this.bases = []

        this.in_progress = false
    }

    start_game() {
        if (this.in_progress) return
        if (this.members.length < 1) return

        for (let uuid of this.members) {
            this.bases.push({
                'uuid': uuid,
                'cards': false
            })
        }

        this.in_progress = true
    }

    list_cards(uuid) {
        for (const base of this.bases) {
            if (base.uuid != uuid) continue

            console.log(this.bases)
        }
    }

    add_card(uuid, card_id, direction) {
        direction = direction || 0

        for (const base of this.bases) {
            if (base.uuid != uuid) continue

            if (!base.cards) {
                base.cards = new Card(income)
            }
            else {
                let selected_card
                let cards_to_search = [ base.cards ]
                for (const card of cards_to_search) {
                    if (card.id == card_id) {
                        selected_card = card
                        break
                    }
                    else {
                        if (card.children) {
                            for (let child of card.children) {
                                cards_to_search.push(child)
                            }
                        }
                    }
                }
            }
        }
    }

    join(uuid, password) {
        if (this.members.includes(uuid))
            return {res: false, info: 'allerede medlem'}


        if ( !this.creator_uuid || !this.password || this.password == password ) {
            this.members.push(uuid)
        }
        else {
            return {res: false, info: 'forkert kodeord'}
        }

        if (this.creator_uuid === false) {
            console.log('setting new creator')
            this.creator_uuid = uuid
        }

        return {res: true, info: 'blev medlem af gruppe'}
    }


    remove_player(uuid) {
        if (this.members.includes(uuid)) {
            let index = this.members.indexOf(uuid)
            this.members.splice(index, 1)
        }

        if (this.creator_uuid == uuid) {
            this.creator_uuid = this.members[0] || false
        }
    }
    

    set_password(uuid, password) {
        if (this.creator_uuid != uuid)
            return {res: false, info: 'ikke admin af gruppen'}

        password = password || Funcs.makeid(10)
        this.password = password
    }
}


module.exports = Game