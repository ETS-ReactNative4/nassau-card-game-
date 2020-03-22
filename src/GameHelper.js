// file: src/GameHelper.js
class GameHelper {
    constructor(currentState, ctx) {
        this.state = {...currentState, events: []};
        this.ctx = ctx
    }
    
    // These are marked static because
    // they don't need access to state or ctx.
    static getProp(card, propName) {
        if (card.hasOwnProperty(propName)) {
            return card[propName];
        } else {
            return card.proto[propName];
        }
    }

    static getRoutineProp(card, routineIndex, propName) {
        let protoAttack = card.proto.routines[routineIndex];
        if (card.routines) {
            return card.routines[routineIndex][propName] || protoAttack[propName]
        } else {
            return protoAttack[propName];
        }
    }

    static opponentFor(playerId) { //TODO
        if (playerId === "player_0") {
            return "player_1";
        } else {
            return "player_0";
        }
    }

    pickRandom(arr) {
        const index = Math.floor(this.ctx.random.Number() * arr.length);
        return arr[index];
    }

    getCurrentPlayer() {
        let playerId = "player_" + this.ctx.currentPlayer;
        let currentPlayer = this.state[playerId];
        return {currentPlayer, playerId};
    }

    getOpponentPlayer() {
        let opponentPlayerId = "player_" + ((this.ctx.currentPlayer === "0") ? "1" : "0");
        let opponentPlayer = this.state[opponentPlayerId];
        return {opponentPlayer, opponentPlayerId};
    }

    getOpponentPlayerRelative() {
        let opponentPlayerId = [];
        let opponentPlayer = []; 
        for (let i = 0; i < 4; i++) {
            if ( i < this.ctx.currentPlayer) {
                opponentPlayerId[i] = "player_" + i;
                opponentPlayer[i] = this.state[opponentPlayerId[i]];
            } else {
                let i2 = i+1;
                opponentPlayerId[i] = "player_" + i2;
                opponentPlayer[i] = this.state[opponentPlayerId[i]];
            }
        }
        return {opponentPlayer, opponentPlayerId};
    }

    updateCardLocation(cardId, location) {
        let currentCard = this.state.cards[cardId];
        let card = {...currentCard, location};
        let cards = ImmutableArray.set(this.state.cards, card, cardId);
        this.updateState({...this.state, cards});
    }

    updateState(state) {
        this.state = state;
    }

    constructStateForPlayer(playerId, playerState) {
        let newPlayerState = Object.assign({}, this.state[playerId], playerState);
        return {...this.state, [playerId]: newPlayerState};
    }
}

const ImmutableArray = {
    append(arr, value) {
        return [...arr, value];
    },
    removeAt(arr, index) {
        return [...arr.slice(0, index), ...arr.slice(index + 1)];
    },
    set(arr, value, index) {
        return arr.map((v, i) => {
            if (index === i) {
                return value;
            }
            return v;
        });
    },
    multiSet(arr, values) {
        return arr.map((value, index) => {
            for (let row = values.length - 1; row >= 0; row--) {
                if (index === values[row].index) {
                    return values.splice(row, 1)[0].value;
                }
            }
            return value;
        });
    }
};

export {GameHelper, ImmutableArray};