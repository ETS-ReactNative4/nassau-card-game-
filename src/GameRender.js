import React from 'react';
import {GameHelper} from './GameHelper';

function TriggeredRoutine(props) {
    return <pre className="routine">{props.routine.text}</pre>;
}

function Card(props) {
    const {id, proto, booted} = props.card;
    const {getProp} = GameHelper;
    const title = getProp(props.card, 'Title').replace(/(?:\r\n|\r|\n)/g, '<br />');
    const actionSuccess = getProp(props.card, 'ActionSuccess');
    const failure = getProp(props.card, 'Failure');
    return <div className={`card card-${proto.category} card-${props.zone !== 'hand' ? 'booted' : 'unbooted'}`}>
        <p style={{fontWeight: "bold"}}>{title}</p>
        <p>{actionSuccess}</p>
        <p style={{color:"#641E16"}}>{failure}</p>        
    </div>;
}

function HiddenCard(props) {
    return <div className="card card-hidden"></div>
}

class Stat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            statClass: 'stat'
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            this.setState({
                statClass: 'stat highlight'
            });
            setTimeout(() => {
                this.setState({
                    statClass: 'stat'
                });
            }, 2000);
        }
    }

    render() {
        let {icon, value} = this.props;
        let statClass = []
        return <span>
            <img src={"/icon/"+icon+".png"} width="32" className="icon"/>
            <span className={this.state.statClass}>{value}</span>
        </span>;
    }
}

// This is a React component.
// If you've not used React before I recommend you read up on it.
// TODO: Change the Renderer to use three.js
class GameRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.playCard = this.playCard.bind(this);
    }

    playCard(cardId) {
        this.props.moves.playCard(cardId);
    }

    // Split the card rendering into it's own function.
    // I've also added buttons for the attacks.
    renderCard(cardId, zone, team) {
        let card = this.props.G.cards[cardId];
        let onPlay = () => {
            this.playCard(cardId);
        };
        return <Card 
            key={cardId} 
            card={card} 
            zone={zone}
            onPlay={onPlay}/>
    }

    render() {
        // Get state references.
        const state = this.props.G;
        const ctx = this.props.ctx;
        const helper = this.helper = new GameHelper(state, ctx);
        const {currentPlayer, playerId} = helper.getCurrentPlayer();
        const {opponentPlayer,opponentPlayerId} = helper.getOpponentPlayerRelative();
        
        // Create an array of <div> for each card in the player hand.
        // React allows JSX. I can combine HTML and Javascript in the same file.
        const playerHand = currentPlayer.hand.map(c => this.renderCard(c, 'hand', 'friendly'));
        const playerField = currentPlayer.field.map(c => this.renderCard(c, 'field', 'friendly'));
        const opponentField0 = opponentPlayer[0].field.map(c => this.renderCard(c, 'field', 'enemy'));
        const opponentField1 = opponentPlayer[1].field.map(c => this.renderCard(c, 'field', 'enemy'));
        const opponentField2 = opponentPlayer[2].field.map(c => this.renderCard(c, 'field', 'enemy'));        

        return <div>
            <div className="board">
                <div id={"hand-"+playerId} >
                    <h4>{playerId}</h4>
                    <div className="stats">
                        <Stat icon="GoldCoin" value={currentPlayer.goldCoin} />
                        <Stat icon="VictoryPoint" value={currentPlayer.victoryPoints} />
                        <Stat icon="HandCards" value={currentPlayer.hand.length} />
                    </div>
                    {playerHand}
                </div>
                <div id={"field-"+playerId}>{playerField}</div>
                <div id={"field-"+opponentPlayerId[0]}>
                    <h4>{opponentPlayerId[0]}</h4>
                    <div className="stats">
                        <Stat icon="GoldCoin" value={opponentPlayer[0].goldCoin} />
                        <Stat icon="VictoryPoint" value={opponentPlayer[0].victoryPoints} />
                        <Stat icon="HandCards" value={opponentPlayer[0].hand.length} />
                    </div> 
                    {opponentField0}
                </div>
                <div id={"field-"+opponentPlayerId[1]}>
                    <h4>{opponentPlayerId[1]}</h4>
                    <div className="stats">
                        <Stat icon="GoldCoin" value={opponentPlayer[1].goldCoin} />
                        <Stat icon="VictoryPoint" value={opponentPlayer[1].victoryPoints} />
                        <Stat icon="HandCards" value={opponentPlayer[1].hand.length} />
                    </div> 
                    {opponentField1}
                </div>
                <div id={"field-"+opponentPlayerId[2]}>
                    <h4>{opponentPlayerId[2]}</h4>
                    <div className="stats">
                        <Stat icon="GoldCoin" value={opponentPlayer[2].goldCoin} />
                        <Stat icon="VictoryPoint" value={opponentPlayer[2].victoryPoints} />
                        <Stat icon="HandCards" value={opponentPlayer[2].hand.length} />
                    </div> 
                    {opponentField2}
                </div>                                
            </div>
        </div>;
    }
}

export default GameRender;