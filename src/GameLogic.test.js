// file: src/GameLogic.test.js
import {initialState, drawCard, playCard, trashCard, attack, onTurnStart} from './GameLogic';
import CardPrototypes from './CardPrototypes.json';

const mockCtx = {
    numPlayers: 2,
    turn: 0,
    currentPlayer: "0",
    playOrder: ["0", "1"]
};
let cardId = 0;
const mockCards = [];
CardPrototypes.forEach(card => {
    for (let duplicate = 0; duplicate < 3; duplicate++) {
        mockCards.push({
            id: cardId++,
            proto: card
        });
    }
});
const mockState = {
    cards: mockCards,
    player_0: {
        deck: [0, 1, 2, 3],
        hand: [],
        field: [],
        trash: [],
        maxCpu: 0,
        cpu: 0,
        memory: 4
    },
    player_1: {
        deck: [4, 5, 6, 7],
        hand: [],
        field: [],
        trash: [],
        maxCpu: 0,
        cpu: 0,
        memory: 4
    },
    events: []
};

function setupGame() {
    const state_0 = initialState(mockCtx, mockState);
    const state_1 = onTurnStart(state_0, mockCtx);
    return state_1;
}

test('drawing a card', () => {
    const state_0 = initialState(mockCtx, mockState);
    const state_1 = drawCard(state_0, mockCtx);
    expect(state_0.player_0.deck).toEqual([0, 1, 2, 3]);
    expect(state_1.player_0.deck).toEqual([0, 1, 2]);
    expect(state_0.player_0.hand).toEqual([]);
    expect(state_1.player_0.hand).toEqual([3]);
});

test('playing a card', () => {
    const state_0 = setupGame();
    const state_1 = playCard(state_0, mockCtx, 3);
    expect(state_0.player_0.field).toEqual([]);
    expect(state_0.player_0.hand).toEqual([3]);
    expect(state_1.player_0.field).toEqual([3]);
    expect(state_1.player_0.hand).toEqual([]);
});

test('cpu refresh on turn start', () => {
    const state_0 = setupGame();
    expect(state_0.player_0.cpu).toEqual(1);
    expect(state_0.player_0.maxCpu).toEqual(1);
    state_0.player_0.cpu = 0;
    const state_1 = onTurnStart(state_0, mockCtx);
    expect(state_1.player_0.cpu).toEqual(2);
    expect(state_1.player_0.maxCpu).toEqual(2);
});

test('cpu cost when playing a card', () => {
    const state_0 = setupGame();
    const state_1 = playCard(state_0, mockCtx, 3);
    expect(state_0.player_0.cpu).toEqual(1);
    expect(state_0.player_0.maxCpu).toEqual(1);
    expect(state_1.player_0.cpu).toEqual(0);
    expect(state_1.player_0.maxCpu).toEqual(1);
});

test('prevent playing a card when not enough cpu', () => {
    const state_0 = setupGame();
    state_0.player_0.cpu = 0;
    const state_1 = playCard(state_0, mockCtx, 3);
    expect(state_0.player_0.cpu).toEqual(0);
    expect(state_0.player_0.maxCpu).toEqual(1);
    expect(state_1.player_0.cpu).toEqual(0);
    expect(state_1.player_0.maxCpu).toEqual(1);
    expect(state_1.player_0.field).toEqual([]);
    expect(state_1.player_0.hand).toEqual([3]);
});

test('program attack', () => {
    const state_0 = setupGame();
    state_0.cards[0].booted = true;
    state_0.player_0.field = [0];
    state_0.player_1.field = [1];
    const instigatorId = 0;
    const attackIndex = 0;
    const targetId = 1;
    const state_1 = attack(state_0, mockCtx, instigatorId, attackIndex, targetId);
    const instigator = state_1.cards[instigatorId];
    const target = state_1.cards[targetId];
    expect(instigator.usedAttacks).toBeDefined();
    expect(instigator.usedAttacks).toContain(attackIndex);
    expect(target.strength).toEqual(target.proto.strength - instigator.proto.attacks[attackIndex].damage);
});

test('trash a card', () => {
    const state_0 = setupGame();
    let cardId = state_0.player_0.hand[0];
    const state_1 = trashCard(state_0, mockCtx, "player_0", "hand", cardId);
    expect(state_1.player_0.hand).toEqual([]);
    expect(state_1.player_0.trash).toEqual([cardId]);
});