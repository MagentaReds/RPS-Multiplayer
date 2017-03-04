const choiceArray = ["None", "Rock", "Paper", "Scissors"];  //0, 1, 2 for R,P,S for choices.

const gameStates={
  waitingForPlayers: "Waiting for all players to join", 
  readyToStartGame: "Every one is here, time to start!",
  waitingForPlayerChoices: "Waiting for all players to pick a move", 
  displayResults: "Results of the round are being display",
  playerHasDisconnected: "One of the players has disconnected, waiting for another player",
  gameLoaded: "The game has loaded"
};

const playerModes={
  none: "none",
  one: "player1",
  two: "player2",
  spectator: "spectator"
};


var rps_game = {
  player1: {
      name: "",
      choice: 0,
      wins: 0,
      losses: 0,
      joined: false,
      picked: false
    },
  player2: {
      name: "",
      choice: 0,
      wins: 0,
      losses: 0,
      joined: false,
      picked: false
    },
  playerMode: playerModes.spectator,
  player: null,
  player_ref: null,
  chat_ref: database.ref("chat"),
  chat_ref_delete: null,
  lastGameState: gameStates.waitingForPlayers,
  gameState: gameStates.waitingForPlayers,


  initialize: function(){

  },

  selectChoice: function(choice) {

  },

  joinGame: function(name) {

  },

  addPlayer: function(snapshot) {

  },

  removePlayer: function(snapshot) {

  },

  updatePlayer1: function(snapshot) {

  },

  updatePlayer2: function(snapshot) {

  },

  sendMessage: function(message) {

  },

  addChatMessage: function(message) {

  }
};


$(document).ready(function(){

  $(".player-choice").on("click", function(event){
    rps_game.selectChoice($(this).attr("data-choice"));
  });

  $("#submit-name").on("click", function(event){
    rps_game.joinGame($("#name-input").val().trim());
  });

  $("#send-message").on("click", function(event){
    rps_game.sendMessage($("#chat-message").val().trim());
    $("#chat-message").val("");
  });



  database.ref("player").on("child_added", function(snapshot){
      rps_game.addPlayer(snapshot);
    }, function(errObject){
      console.log("Errors handled: " + errObject.code);
  });

  database.ref("player").on("child_removed", function(snapshot){
      rps_game.removePlayer(snapshot);
    }, function(errObject){
      console.log("Errors handled: " + errObject.code);
  });

  database.ref("player/1").on("value", function(snapshot){
      if(snapshot.exists())
        rps_game.updatePlayer1(snapshot);
    }, function(errObject){
      console.log("Errors handled: " + errObject.code);
  });
  database.ref("player/2").on("value", function(snapshot){
      if(snapshot.exists())
        rps_game.updatePlayer2(snapshot);
    }, function(errObject){
      console.log("Errors handled: " + errObject.code);
  });

  database.ref("chat").on("child_added", function(snapshot){
      rps_game.addChatMessage(snapshot.val().message);
    }, function(errObject){
      console.log("Errors handled: " + errObject.code);
  });


  rps_game.initialize();
  console.log("Script loaded succsesfuly")

});
