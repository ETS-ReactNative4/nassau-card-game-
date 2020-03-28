import React from 'react';
import {GameHelper} from './GameHelper';

function Card(props) {
    const {getProp} = GameHelper;
    const title = getProp(props.card, 'Title');
    const actionSuccess = getProp(props.card, 'ActionSuccess');
    const indexAction = title.indexOf(">");
    const actionType = title.substring(0,indexAction)
    const failure = getProp(props.card, 'Failure');
    const additionalButtons = [];
    if (props.zone === 'hand') {
        additionalButtons.push(<button className="card-button" key="play" onClick={props.onPlay}>PREPARAR ACCION y TERMINAR</button>);
    }
    if (props.zone === 'field' || props.zone === 'fieldP') {
        additionalButtons.push(<button className="card-button" key="play" onClick={props.onTryDiscard}>HACER TIRADA</button>);
    }   
    return <div className={`card card-${actionType} card-${props.zone !== 'hand' ? 'booted' : 'unbooted'}`}>
        {additionalButtons}
        <p style={{fontWeight: "bold"}}>{title}</p>
        <p>{actionSuccess}</p>
        <p style={{color:"#641E16"}}>{failure}</p>        
    </div>;
}

class Attribute extends React.Component {
    render() {
        let {desc, value} = this.props;

        return (
          <span>
            <center><b>{desc}............................</b>+{value}</center>
          </span>
        );
    }
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
        this.state = {}
        this.playCard = this.playCard.bind(this);
        this.playCardP = this.playCardP.bind(this);
        this.onDraw = this.onDraw.bind(this);
        this.onEndTurn = this.onEndTurn.bind(this);
    }

    playCard(cardId) {
        this.props.moves.playCard(cardId);
    }

    playCardP(cardId) {
        this.props.moves.playCardP(cardId);
    }

    onDraw () {
        this.props.moves.drawCard();
        this.props.events.endTurn();
    };

    onEndTurn () {
        this.props.events.endTurn();
    };

    // Split the card rendering into it's own function.
    // I've also added buttons for the attacks.
    renderCard(cardId, zone, team) {
        let card = this.props.G.cards[cardId];       
        return <Card 
            key={cardId} 
            card={card} 
            zone={zone}/>
    }

    renderCardP(cardId, zone, team) {
        let cardP = this.props.G.cardsP[cardId];        
        return <Card 
            key={cardId} 
            card={cardP} 
            zone={zone}/>
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

        const playerFieldP = currentPlayer.fieldP.map(c => this.renderCardP(c, 'fieldP', 'friendly'));
        const opponentFieldP0 = opponentPlayer[0].fieldP.map(c => this.renderCardP(c, 'fieldP', 'enemy'));
        const opponentFieldP1 = opponentPlayer[1].fieldP.map(c => this.renderCardP(c, 'fieldP', 'enemy'));
        const opponentFieldP2 = opponentPlayer[2].fieldP.map(c => this.renderCardP(c, 'fieldP', 'enemy'));

        const playerField = currentPlayer.field.map(c => this.renderCard(c, 'field', 'friendly'));
        const opponentField0 = opponentPlayer[0].field.map(c => this.renderCard(c, 'field', 'enemy'));
        const opponentField1 = opponentPlayer[1].field.map(c => this.renderCard(c, 'field', 'enemy'));
        const opponentField2 = opponentPlayer[2].field.map(c => this.renderCard(c, 'field', 'enemy'));        

        return <div>
            <div className="head">
            FUErza: Combate cuerpo a cuerpo, decisivo en abordaje de barcos y para recuperarse de las heridas<br></br>
            NAVegación: Para buscar y dar caza a barcos mercantes o encontrar islas en los mapas<br></br>            
            BAJos fondos: Para conseguir tripulación y tratar con piratas y escoria de similar ralea<br></br>
            LIDerazgo: Para conseguir poderosos aliados y tratar con los nobles y la corona inglesa<br></br>
            NEGociación: Para sacar mejores resultados económicos al comprar, vender, sobornar...<br></br>
            OBServación: Encontrar pistas, secretos de otros y formas de apropiarse de objetos poco vigilados<br></br>
            </div>
            <div className="board">
                <div id={"hand-"+playerId} >
                    <h2>{currentPlayer.name}</h2>
                    <div className={"stats-"+playerId}>
                        <Attribute desc="FUE" value={currentPlayer.FUE}/>
                        <Attribute desc="NAV" value={currentPlayer.NAV}/>                       
                        <Attribute desc="BAJ" value={currentPlayer.BAJ}/>
                        <Attribute desc="LID" value={currentPlayer.LID}/>
                        <Attribute desc="NEG" value={currentPlayer.NEG}/>
                        <Attribute desc="OBS" value={currentPlayer.OBS}/>                        
                    </div>
                    <div className="stats">
                        <Stat icon="GoldCoin" value={currentPlayer.goldCoin} />
                        <Stat icon="VictoryPoint" value={currentPlayer.victoryPoints} />
                        <Stat icon="HandCards" value={currentPlayer.hand.length} />
                    </div>
                    <div className="stats">
                    <button className="card-button" key="play" onClick={this.onAddCoin}>RECIBIR 1mo</button>
                    <button className="card-button" key="play" onClick={this.onSubCoin}>PAGAR 1mo</button>
                    <button className="card-button" key="play" onClick={this.onWinPoint}>GANAR 1PV</button>
                    </div>
                    <button className="card-button-header" key="draw" onClick={this.onDraw}>BUSCAR OPCIONES y TERMINAR</button>                    
                    {playerHand}
                </div>
                <div id={"field-"+playerId}>
                    {playerFieldP}
                    {playerField}
                    <button className="card-button-header" key="end" onClick={this.onEndTurn}>PASAR TURNO</button>
                </div>
                <div id={"field-"+opponentPlayerId[0]}>
                    <h2>{opponentPlayer[0].name}</h2>
                    <div className={"stats-"+opponentPlayerId[0]}>
                        <Attribute desc="FUE" value={opponentPlayer[0].FUE}/>
                        <Attribute desc="NAV" value={opponentPlayer[0].NAV}/>                       
                        <Attribute desc="BAJ" value={opponentPlayer[0].BAJ}/>
                        <Attribute desc="LID" value={opponentPlayer[0].LID}/>
                        <Attribute desc="NEG" value={opponentPlayer[0].NEG}/>
                        <Attribute desc="OBS" value={opponentPlayer[0].OBS}/>                        
                    </div>
                    <div className="stats">
                        <Stat icon="GoldCoin" value={opponentPlayer[0].goldCoin} />
                        <Stat icon="VictoryPoint" value={opponentPlayer[0].victoryPoints} />
                        <Stat icon="HandCards" value={opponentPlayer[0].hand.length} />
                    </div> 
                    {opponentFieldP0}
                    {opponentField0}
                </div>
                <div id={"field-"+opponentPlayerId[1]}>
                    <h2>{opponentPlayer[1].name}</h2>
                    <div className={"stats-"+opponentPlayerId[1]}>
                        <Attribute desc="FUE" value={opponentPlayer[1].FUE}/>
                        <Attribute desc="NAV" value={opponentPlayer[1].NAV}/>                       
                        <Attribute desc="BAJ" value={opponentPlayer[1].BAJ}/>
                        <Attribute desc="LID" value={opponentPlayer[1].LID}/>
                        <Attribute desc="NEG" value={opponentPlayer[1].NEG}/>
                        <Attribute desc="OBS" value={opponentPlayer[1].OBS}/>                        
                    </div>                    
                    <div className="stats">
                        <Stat icon="GoldCoin" value={opponentPlayer[1].goldCoin} />
                        <Stat icon="VictoryPoint" value={opponentPlayer[1].victoryPoints} />
                        <Stat icon="HandCards" value={opponentPlayer[1].hand.length} />
                    </div>
                    {opponentFieldP1}
                    {opponentField1}
                </div>
                <div id={"field-"+opponentPlayerId[2]}>
                    <h2>{opponentPlayer[2].name}</h2>
                    <div className={"stats-"+opponentPlayerId[2]}>
                        <Attribute desc="FUE" value={opponentPlayer[2].FUE}/>
                        <Attribute desc="NAV" value={opponentPlayer[2].NAV}/>                       
                        <Attribute desc="BAJ" value={opponentPlayer[2].BAJ}/>
                        <Attribute desc="LID" value={opponentPlayer[2].LID}/>
                        <Attribute desc="NEG" value={opponentPlayer[2].NEG}/>
                        <Attribute desc="OBS" value={opponentPlayer[2].OBS}/>                        
                    </div>                    
                    <div className="stats">
                        <Stat icon="GoldCoin" value={opponentPlayer[2].goldCoin} />
                        <Stat icon="VictoryPoint" value={opponentPlayer[2].victoryPoints} />
                        <Stat icon="HandCards" value={opponentPlayer[2].hand.length} />
                    </div>
                    {opponentFieldP2}
                    {opponentField2}
                </div>                                
            </div>
        </div>;
    }
}

export default GameRender;