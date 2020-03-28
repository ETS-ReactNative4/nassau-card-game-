// file: src/GameLogic.js
import NassauCards from './NassauCardList.json';
import {GameHelper, ImmutableArray} from './GameHelper';
//import {GameEvents, GameEventValidator} from './GameEvents';

function initialState(ctx, state) {
    let cards = [];
    for (let index = 0; index < NassauCards.length; index++) {
        cards.push({
            id: index,
            proto: NassauCards[index]
        });
    }
    let actionDeck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
    let helper = new GameHelper(state, ctx);
    actionDeck = helper.shuffleArray(actionDeck);
    let initialState = state || {
        actionDeck,
        player_0: {
            id: 0,
            name: 'Jhon Silver',          
            hand: [27, 38],
            field: [30],
            goldCoin: 1,
            victoryPoints: 0,
            FUE: 0,
            NAV: 0,
            NEG: 0,
            BAJ: 1,
            LID: 0,
            OBS: 1,
            grantFUE: [true, true, false, false],
            grantNAV: [false, false, false, false],
            grantNEG: [false, false, false, false],
            grantBAJ: [false, false, false, false],
            grantLID: [false, false, false, false],
            grantOBS: [false, false, false, false]
        },
        player_1: {
            id: 1,
            name: 'Eleanor Guthrie',
            hand: [22],
            field: [12, 19],
            goldCoin: 1,
            victoryPoints: 0,
            FUE: 0,
            NAV: 0,
            NEG: 1,
            BAJ: 0,
            LID: 1,
            OBS: 0,
            grantFUE: [false, false, false, false],
            grantNAV: [false, false, false, false],
            grantNEG: [false, false, false, false],
            grantBAJ: [false, false, false, false],
            grantLID: [false, false, false, false],
            grantOBS: [false, false, false, false]
        },
        player_2: {
            id: 2,
            name: 'Capitán Flint',
            hand: [],
            field: [11, 18],
            goldCoin: 1,
            victoryPoints: 0,
            FUE: 0,
            NAV: 2,
            NEG: 0,
            BAJ: 0,
            LID: 0,
            OBS: 0,
            grantFUE: [false, false, false, false],
            grantNAV: [false, false, false, false],
            grantNEG: [false, false, false, false],
            grantBAJ: [false, false, false, false],
            grantLID: [false, false, false, false],
            grantOBS: [false, false, false, false]
        },
        player_3: {
            id: 3,
            name: 'Capitán Charles Vane',
            hand: [],
            field: [13,21],
            goldCoin: 1,
            victoryPoints: 0,
            FUE: 2,
            NAV: 0,
            NEG: 0,
            BAJ: 0,
            LID: 0,
            OBS: 0,
            grantFUE: [false, false, false, false],
            grantNAV: [false, false, false, false],
            grantNEG: [false, false, false, false],
            grantBAJ: [false, false, false, false],
            grantLID: [false, false, false, false],
            grantOBS: [false, false, false, false]
        },                
        cards
    };
    const zones = ['hand', 'field'];
    const players = ['player_0', 'player_1',  'player_2',  'player_3'];
    players.forEach(playerId => {
        zones.forEach(zone => {
            initialState[playerId][zone].forEach(cardId => {
                cards[cardId].location = {playerId, zone};
            });
        });
    });
    return initialState;
}

function drawCard(currentState, ctx) {
    let playerId = "player_" + ctx.currentPlayer;
    return drawCardForPlayer(currentState, ctx, playerId);
}

function drawCardForPlayer(currentState, ctx, playerId) {
    let helper = new GameHelper(currentState, ctx);
    let player = currentState[playerId];
    // Add the last card in the player's deck to their hand.
    let deckIndex = currentState.actionDeck.length - 1;
    let cardId = currentState.actionDeck[deckIndex];
    let hand = ImmutableArray.append(player.hand, cardId);
    helper.updateCardLocation(cardId, {playerId, zone: 'hand'});
    // Remove the last card in the deck.
    currentState.actionDeck = ImmutableArray.removeAt(currentState.actionDeck, deckIndex);
    helper.updateState(currentState);
    // Construct and return a new state object with our changes.
    let state = helper.constructStateForPlayer(playerId, {hand});
    return state;
}

function playCard(currentState, ctx, cardId) {
    let helper = new GameHelper(currentState, ctx);
    let {currentPlayer, playerId} = helper.getCurrentPlayer();
    // Find the card in their hand.
    let handIndex = currentPlayer.hand.indexOf(cardId);
    let card = currentState.cards[cardId];
    // Ensure the card is in the player's hand and they can afford it.
    if (handIndex !== -1 
        && card ) {
        // Add the card to the player's field.
        let field = ImmutableArray.append(currentPlayer.field, currentPlayer.hand[handIndex]);
        helper.updateCardLocation(currentPlayer.hand[handIndex], {playerId, zone: 'field'});
        // Remove the card from their hand.
        let hand = ImmutableArray.removeAt(currentPlayer.hand, handIndex);
        // Construct and return a new state object with our changes.
        let state = helper.constructStateForPlayer(playerId, {hand, field});
        return state;
    } 
}

function trashCard(currentState, ctx, cardId) {
    debugger;
    const helper = new GameHelper(currentState, ctx);
    const card = currentState.cards[cardId];
    const playerId = card.location.playerId;
    const player = currentState[playerId];
    const currentZoneId = card.location.zone;
    const currentZone = player[currentZoneId];
    const isCardValid = card && currentZone.includes(cardId);
    if (isCardValid) {
        // Remove the card from it's current location.
        let currentZoneIndex = currentZone.indexOf(cardId);
        const zone = ImmutableArray.removeAt(currentZone, currentZoneIndex);
        let state = helper.constructStateForPlayer(playerId, {zone});
        // Add the card to deck's bottom 
        currentState.actionDeck = ImmutableArray.append(currentState.actionDeck, cardId);
        //helper.updateState(currentState);
        currentState = {...state, currentState};
    }
    return currentState;
}

function onTurnStart(currentState, ctx) {
    let helper = new GameHelper(currentState, ctx);
    let {currentPlayer, playerId} = helper.getCurrentPlayer();
    let cards = currentState.cards;
    let actionDeck = currentState.actionDeck;
    let state = {...helper.constructStateForPlayer(playerId), cards, actionDeck};
    return state;
}

const GameLogic = {
    initialState, 
    drawCardForPlayer,
    drawCard,
    playCard, 
    trashCard,
    onTurnStart
};
export default GameLogic;