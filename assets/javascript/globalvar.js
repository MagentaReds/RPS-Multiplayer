var config = {
  apiKey: "AIzaSyCZL3qUBNYs2yGBcIBIBSb4PjrpXWtuTDU",
  authDomain: "rps-multiplayer-a5d08.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-a5d08.firebaseio.com",
  storageBucket: "rps-multiplayer-a5d08.appspot.com",
  messagingSenderId: "143526038238"
};
firebase.initializeApp(config);
var database=firebase.database();

const choiceArray = ["None", "Rock", "Paper", "Scissors"];  //0, 1, 2 for R,P,S for choices.

//my enums
const gameStates={
  waitingForPlayers: "Waiting for all players to join", 
  readyToStartGame: "Every one is here, time to start!",
  waitingForPlayerChoices: "Waiting for all players to pick a move", 
  displayResults: "Results of the round are being displayed",
  playerHasDisconnected: "One of the players has disconnected, waiting for another player",
  gameLoaded: "The game has loaded"
};

const windowModes= {
  player1: "player1",
  player2: "player2",
  spectator: "Spectator"
};

const playerModes={
  none: "none",
  player: "player",
  enemy: "enemy",
};

const playerStates={
  none: "No active player for this slot",
  justJoined: "Player has joined the game!",
  picking: "Waiting on choice",
  justPicked: "Just picked and waiting for results",
  justLeft: "Player just disconnected, Need to clean up game"
};

