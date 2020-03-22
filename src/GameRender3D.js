import React from 'react';
import { diff, observableDiff } from 'deep-diff';
const THREE = require("three");

function makeCard() {
    var geometry = new THREE.BoxGeometry( 1, 1.4, 0.1 );
    var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    var mesh = new THREE.Mesh( geometry, material );
    return mesh;
}

function makeText(font, message) {
    const matLite = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide
    });
    const shapes = font.generateShapes(message, 1);
    const geometry = new THREE.ShapeBufferGeometry(shapes);
    geometry.computeBoundingBox();
    let xMid = 0.5 * ( geometry.boundingBox.max.x - geometry.boundingBox.min.x );
    let yMid = 0.5 * ( geometry.boundingBox.max.y - geometry.boundingBox.min.y );
    geometry.translate( -xMid, -yMid, 0 );
    const mesh = new THREE.Mesh(geometry, matLite);
    return mesh;
}

class GameRender3D extends React.Component {
    componentDidMount() {
        const scene = this.scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f0f0);
        const camera = new THREE.PerspectiveCamera(
            20,
            window.innerWidth / window.innerHeight,
            1,
            1000
        );
        camera.position.set(5, 0, 50);
        scene.add(camera);

        const renderer = new THREE.WebGLRenderer({ antialias: false });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.canvasContainer.appendChild(renderer.domElement);

        this.meshes = [];
        this.mixers = [];
        const ctx = this.props.ctx;
        const state = this.props.G;
        const player = state["player_"+ctx.currentPlayer];
        var loader = new THREE.FontLoader();
        loader.load( '/fonts/helvetiker_regular.typeface.json', ( font ) => {
            this.font = font;
            player.hand.forEach((cardId, index) => {
                this.addCard(cardId, index, 'hand');
            });
        });

        const clock = new THREE.Clock();
        const renderLoop = () => {
            requestAnimationFrame(renderLoop);
            const delta = clock.getDelta();
            this.mixers.forEach(mixer => {
                mixer.update(delta);
            });
            renderer.render(scene, camera);
        };
        renderLoop();
    }

    addCard(cardId, index, zone) {
        let mesh = makeCard();
        let text1 = makeText(this.font, cardId.toString());
        text1.position.z = 0.1;
        text1.position.x = 0;
        let group = new THREE.Group();
        group.add(mesh);
        group.add(text1);
        group.gameData = {cardId};
        group.position.x = index * 1.5;
        let mixer = new THREE.AnimationMixer(group);
        group.mixer = mixer;
        // this.mixers.push(mixer);
        this.scene.add(group);
        this.meshes.push({
            zone,
            id: cardId,
            mesh: group
        });
        return group;
    }

    componentDidUpdate(prevProps) {
        const {G, ctx} = this.props;
        const playerId = "player_"+ctx.currentPlayer;
        const player = G[playerId];
        this.scene.remove(...this.scene.children);
        this.meshes = [];
        this.mixers = [];
        
        player.hand.forEach((cardId, index) => {
            if (cardId) {
                this.addCard(cardId, index, 'hand');
            }
        });
        
        console.log('update');
        const change = diff(prevProps.G.cards, G.cards);
        if (change) {
            console.log(change);
            change.filter(edit => edit.kind === "E").forEach(edit => {
                const cardId = edit.path[0];
                if (edit.path[1] === "location" && G.cards[cardId].location.playerId === playerId) {
                    if (edit.rhs === "hand") {
                        let obj = this.meshes.find(m => m.id === cardId);
                        let card = obj.mesh;
                        let posTrack = new THREE.VectorKeyframeTrack('.position', [0, 0.5, 1, 1.5], [
                            0, 5, 0,
                            3, 2, 20,
                            3, 2, 20,
                            card.position.x, card.position.y, card.position.z
                        ], THREE.InterpolateSmooth);
                        var axis = new THREE.Vector3( 0, 1, 0 );
                        var qInitial = new THREE.Quaternion().setFromAxisAngle( axis, Math.PI/2 );
				        var qFinal = new THREE.Quaternion().setFromAxisAngle( axis, 0 );
                        let quatTrack = new THREE.QuaternionKeyframeTrack('.quaternion', [0, 0.5, 1, 1.5], [
                            qInitial.x, qInitial.y, qInitial.z, qInitial.w,
                            qFinal.x, qFinal.y, qFinal.z, qFinal.w,
                            qFinal.x, qFinal.y, qFinal.z, qFinal.w,
                            qFinal.x, qFinal.y, qFinal.z, qFinal.w,
                        ]);
                        let clip = new THREE.AnimationClip("enter", -1, [posTrack, quatTrack]);
                        let clipAction = card.mixer.clipAction(clip);
                        clipAction.loop = THREE.LoopOnce;
                        clipAction.reset().play();
                        this.mixers.push(card.mixer);
                    }
                }
            });
        }


        // if (change) {
        //     change.filter(edit => edit.kind === "E").forEach(edit => {
        //         const cardId = edit.path[0];
        //         if (edit.path[1] === "location" && G.cards[cardId].location.playerId === playerId) {
        //             const handIndex = player.hand.indexOf(cardId);
        //             if (edit.rhs === "hand") {
        //                 this.addCard(cardId, handIndex, 'hand');
        //             } else if (edit.lhs === "hand") {
        //                 let index = this.meshes.findIndex(mesh => mesh.id === cardId);
        //                 this.scene.remove(this.meshes[index].mesh);
        //                 this.meshes.splice(index, 1);
        //                 this.meshes.filter(mesh => mesh.zone === 'hand').forEach((mesh, index) => {
        //                     mesh.mesh.position.x = index * 1.5;
        //                 });
        //             }
        //         }
        //     });
        // }
    }

    render() {
        return <div ref={el => {this.canvasContainer = el;}}></div>
    }
}

export default GameRender3D;