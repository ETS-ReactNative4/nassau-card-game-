import {GameHelper} from './GameHelper';

const GameEvents = {
    'deal-damage': (state, ctx, GameLogic, trigger, {target, damage}) => {
        let helper = new GameHelper(state, ctx);
        let {currentPlayer} = helper.getCurrentPlayer();
        let {opponentPlayer} = helper.getOpponentPlayer();
        // Find a target.
        let candidates = [];
        if (target.player === "enemy" || target.player === "both") {
            const _candidates = opponentPlayer[target.zone]
                .filter(cardId => state.cards[cardId].proto.category === target.category);
            candidates = [...candidates, ..._candidates];
        } else if (target.player === "self" || target.player === "both") {
            const _candidates = currentPlayer[target.zone]
                .filter(cardId => state.cards[cardId].proto.category === target.category);
            candidates = [...candidates, ..._candidates];
        }
        // If we have multiple valid targets, pick one at random.
        const targetCardId = helper.pickRandom(candidates);
        if (targetCardId) {
            return GameLogic.dealDamage(state, ctx, targetCardId, damage);
        }
    },
    'draw-card': (state, ctx, GameLogic, {cardId}, {target}) => {
        const card = state.cards[cardId];
        if (target.player === "self") {
            return GameLogic.drawCardForPlayer(state, ctx, card.location.playerId);
        } else if (target.player === "enemy") {
            const opponentPlayerId = GameHelper.opponentFor(card.location.playerId); //TODO: Resoldre problema
            return GameLogic.drawCardForPlayer(state, ctx, opponentPlayerId);
        }
    }
};

const GameEventValidator = {
    'play-card': (state, ctx, trigger, payload) => {
        let helper = new GameHelper(state, ctx);
        let {playerId} = helper.getCurrentPlayer();
        let {opponentPlayerId} = helper.getOpponentPlayer();
        let isSameCategory = trigger.event.category === payload.category;
        if (trigger.event.player === "self") {
            return playerId === payload.playerId && isSameCategory;
        } else if (trigger.event.player === "enemy") {
            return opponentPlayerId === payload.playerId && isSameCategory;
        } else {
            return isSameCategory;
        }
    },
    'deal-damage': (state, ctx, trigger, payload) => {
        if (trigger.event.target === 'self') {
            return payload.cardId === trigger.cardId;
        }
        // TODO: handle additional targets.
    },
};

export {GameEvents, GameEventValidator};