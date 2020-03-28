// file: src/GameLogic.js
import NassauCards from './NassauCardList.json';
import NassauCardsP from './NassauCardListPermanent.json';
import {GameHelper, ImmutableArray} from './GameHelper';
//import {GameEvents, GameEventValidator} from './GameEvents';

function initialState(ctx, state) {
    let cards = [];
    let cardsP = [];
    for (let index = 0; index < NassauCards.length; index++) {
        cards.push({
            id: index,
            proto: NassauCards[index]
        });
    }
    for (let index = 0; index < NassauCardsP.length; index++) {
        cardsP.push({
            id: index,
            proto: NassauCardsP[index]
        });
    }    
    let actionDeck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
    let permanentDeck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
    let helper = new GameHelper(state, ctx);
    actionDeck = helper.shuffleArray(actionDeck);
    let initialState = state || {
        actionDeck,
        permanentDeck,
        player_0: {
            id: 0,
            name: 'Jhon Silver',          
            hand: [27, 38],
            fieldP: [7],
            field: [],
            goldCoin: 1,
            victoryPoints: 0,
            FUE: 0,
            NAV: 0,
            NEG: 0,
            BAJ: 2,
            LID: 0,
            OBS: 1
        },
        player_1: {
            id: 1,
            name: 'Eleanor Guthrie',
            hand: [22],
            fieldP: [4, 6],
            field: [],
            goldCoin: 1,
            victoryPoints: 0,
            FUE: 0,
            NAV: 0,
            NEG: 2,
            BAJ: 0,
            LID: 1,
            OBS: 0
        },
        player_2: {
            id: 2,
            name: 'Cpt Flint',
            hand: [],
            fieldP: [5],
            field: [],
            goldCoin: 1,
            victoryPoints: 0,
            FUE: 0,
            NAV: 3,
            NEG: 0,
            BAJ: 0,
            LID: 0,
            OBS: 0
        },
        player_3: {
            id: 3,
            name: 'Cpt Charles Vane',
            hand: [],
            fieldP: [8],
            field: [],
            goldCoin: 1,
            victoryPoints: 0,
            FUE: 3,
            NAV: 0,
            NEG: 0,
            BAJ: 0,
            LID: 0,
            OBS: 0
        },                
        cards,
        cardsP
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

function playCardP(currentState, ctx, cardName) {
    let helper = new GameHelper(currentState, ctx);
    let playerId = "player_" + ctx.currentPlayer;
    let player = currentState[playerId];
    // Add the last card in the player's deck to their hand.
    let deckIndex = 0; //TODO: Fer que busque el cardName en el deck de cartes perm

    let cardId = currentState.permanentDeck[deckIndex];
    let fieldP = ImmutableArray.append(player.fieldP, cardId);
    helper.updateCardLocation(cardId, {playerId, zone: 'fieldP'});
    // Remove the last card in the deck.
    currentState.permanentDeck = ImmutableArray.removeAt(currentState.permanentDeck, deckIndex);
    helper.updateState(currentState);
    // Construct and return a new state object with our changes.
    let state = {...state, currentState};
    return state;
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