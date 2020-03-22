// file: src/GameLogic.js
import NassauCards from './NassauCardList.json';
import {GameHelper, ImmutableArray} from './GameHelper';
import {GameEvents, GameEventValidator} from './GameEvents';

function initialState(ctx, state) {
    let cardId = 0;
    let cards = [];
    for (let index = 0; index < NassauCards.length; index++) {
        cards.push({
            id: cardId++,
            proto: NassauCards[index]
        });
    }
    let initialState = state || {
        player_0: {
            deck: [10, 15, 20, 24, 35, 18],
            hand: [27, 38],
            field: [30],
            trash: [],
            goldCoin: 1,
            victoryPoints: 0
        },
        player_1: {
            deck: [39, 40, 44],
            hand: [],
            field: [12, 19],
            trash: [],
            goldCoin: 1,
            victoryPoints: 0
        },
        player_2: {
            deck: [43, 45, 28],
            hand: [],
            field: [11, 18],
            trash: [],
            goldCoin: 1,
            victoryPoints: 0
        },
        player_3: {
            deck: [14,18,20],
            hand: [],
            field: [13,21],
            trash: [],
            goldCoin: 1,
            victoryPoints: 0
        },                
        cards
    };
    const zones = ['deck', 'hand', 'field', 'trash']; //actionDeck + permanentDeck
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
    let deckIndex = player.deck.length - 1;
    let cardId = player.deck[deckIndex];
    let hand = ImmutableArray.append(player.hand, cardId);
    helper.updateCardLocation(cardId, {playerId, zone: 'hand'});
    // Remove the last card in the deck.
    let deck = ImmutableArray.removeAt(player.deck, deckIndex);
    // Construct and return a new state object with our changes.
    let state = helper.constructStateForPlayer(playerId, {hand, deck});
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
        && card 
        && currentPlayer.cpu >= card.proto.cpu_cost 
        && currentPlayer.memory >= card.proto.memory_cost) {
        // Add the card to the player's field.
        let field = ImmutableArray.append(currentPlayer.field, currentPlayer.hand[handIndex]);
        helper.updateCardLocation(currentPlayer.hand[handIndex], {playerId, zone: 'field'});
        // Remove the card from their hand.
        let hand = ImmutableArray.removeAt(currentPlayer.hand, handIndex);
        // Pay the CPU cost.
        let cpu = currentPlayer.cpu - card.proto.cpu_cost;
        // Pay the Memory cost.
        let memory = currentPlayer.memory - card.proto.memory_cost;
        // Construct and return a new state object with our changes.
        let state = helper.constructStateForPlayer(playerId, {hand, field, cpu, memory})
        return state;
    } else {
        // We return the unchanged state if we can't play a card.
        return currentState;
    }
}

function trashCard(currentState, ctx, cardId) {
    const helper = new GameHelper(currentState, ctx);
    const card = currentState.cards[cardId];
    const playerId = card.location.playerId;
    const player = currentState[playerId];
    const currentZoneId = card.location.zone;
    const currentZone = player[currentZoneId];
    const isCardValid = card && currentZone.includes(cardId);
    if (isCardValid) {
        // Add the card to the player's trash.
        const trash = ImmutableArray.append(player.trash, cardId);
        helper.updateCardLocation(cardId, {playerId, zone: 'trash'});
        // Remove the card from it's current location.
        let currentZoneIndex = currentZone.indexOf(cardId);
        const zone = ImmutableArray.removeAt(currentZone, currentZoneIndex);
        return helper.constructStateForPlayer(playerId, {trash, [currentZoneId]: zone});
    }
    return currentState;
}

function onTurnStart(currentState, ctx) {
    let helper = new GameHelper(currentState, ctx);
    let {currentPlayer, playerId} = helper.getCurrentPlayer();
    // Increment and restore the player's CPU.
    let maxCpu = currentPlayer.maxCpu + 1;
    // Iterate through all cards on the player's field.
    let cardUpdates = currentPlayer.field.map(cardId => {
        let currentCard = currentState.cards[cardId];
        // Reset card strength, clear usedAttacks and finish booting.
        let card = {
            ...currentCard, 
            usedRoutines: [],
            strength: currentCard.proto.strength,
            booted: true, 
        };
        return {index: cardId, value: card};
    });
    // Create a new cards array, with the updated cards.
    let cards = ImmutableArray.multiSet(currentState.cards, cardUpdates);
    let state = {...helper.constructStateForPlayer(playerId, {maxCpu, cpu: maxCpu}), cards};
    // Draw a card.
    return drawCard(state, ctx);
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