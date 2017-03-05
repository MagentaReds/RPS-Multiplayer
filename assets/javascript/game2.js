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
  player: "player",
  enemy: "enemy",
};

const windowModes= {
  player1: "player1",
  player2: "player2",
  spectator: "Spectator"
};


const playerStates={
  none: "No active player for this slot",
  justJoined: "Player has joined the game!",
  picking: "Waiting on choice",
  justPicked: "Just picked and waiting for results",
  justLeft: "Player just disconnected, Need to clean up game"
};

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCZL3qUBNYs2yGBcIBIBSb4PjrpXWtuTDU",
  authDomain: "rps-multiplayer-a5d08.firebaseapp.com",
  databaseURL: "https://rps-multiplayer-a5d08.firebaseio.com",
  storageBucket: "rps-multiplayer-a5d08.appspot.com",
  messagingSenderId: "143526038238"
};
firebase.initializeApp(config);

var database=firebase.database();


var rps_game = {
  player1: {
      name: "",
      choice: 0,
      wins: 0,
      losses: 0,
      joined: false,
      picked: false,
      mode: playerModes.none,
      state: playerStates.none
    },
  player2: {
      name: "",
      choice: 0,
      wins: 0,
      losses: 0,
      joined: false,
      picked: false,
      mode: playerModes.none,
      state: playerStates.none
    },
  player: null,
  enemy: null,
  player_ref: null,
  chat_ref: database.ref("chat"),
  chat_ref_delete: null,
  lastGameState: gameStates.waitingForPlayers,
  gameState: gameStates.waitingForPlayers,
  windowMode: windowModes.spectator,

  //set reset the game
  initialize: function(){
    this.player1.name="";
    this.player1.choice=0;
    this.player1.wins=0;
    this.player1.losses=0;
    this.player1.joined=false;
    this.player1.picked=false;
    this.player1.mode=playerModes.none;
    this.player1.state=playerStates.none;


    this.player2.name="";
    this.player2.choice=0;
    this.player2.wins=0;
    this.player2.losses=0;
    this.player2.joined=false;
    this.player2.picked=false;
    this.player2.mode=playerModes.none;
    this.player2.state=playerStates.none;

    this.player=null;
    this.enemy=null;
    this.player_ref=null;

    this.winowMode=windowModes.spectator;

    if(this.chat_ref_delete!==null){
      this.chat_ref_delete.cancel();
      this.chat_ref_delete=null;
    }

    this.gameState= gameStates.waitingForPlayers;
  },

  computeResults: function(){
    var result=this.player1.choice-this.player2.choice;
    if(result<0)
      result+=3;
    if(result===0){
      this.updateResultText("Tied!");
    }
    else if(result===1) {
      this.updateResultText(this.player1.name+" Wins!");
      this.player1.wins++;
      this.player2.losses++;
    }
    else{
      this.updateResultText(this.player2.name+" Wins!")
      this.player2.wins++;
      this.player1.losses++;
    }

  },

  nextRound: function() {

    this.hideResults();
    this.hideAllChoices();
    this.player1.picked=false;
    this.player2.picked=false;
    
    database.ref("player/1").set({name: this.player1.name, choice: 0, wins: this.player1.wins, losses: this.player1.losses});
    database.ref("player/2").set({name: this.player2.name, choice: 0, wins: this.player2.wins, losses: this.player2.losses});
    
  },

  checkGameState: function() {
    var playersHere=this.player1.joined && this.player2.joined;
    var playersPicked=this.player1.picked && this.player2.picked;
    var tempGameState=null;

    if(playersHere && !playersPicked)
      tempGameState=gameStates.waitingForPlayerChoices;
    else if(playersHere && playersPicked)
      tempGameState=gameStates.displayResults;
    else if(!playersHere)
      tempGameState=gameStates.waitingForPlayers;

    console.log("Check games state tempGameState="+tempGameState);
    this.changeGameState(tempGameState);
  },

  changeGameState: function(state){
    if(state!==this.gameState){
      this.lastGameState=this.gameState;
      this.gameState=state;
      console.log(this.lastGameState +" ++TO++ "+this.gameState);

      switch(state) {
        case gameStates.waitingForPlayers: //we get here because We were probably waiting for playerchoices, so we need to clean up the board of then player who left
          //the removePlayer function already does most of this work
          //but we need to set us to remove the chat if we also disconnect
          if(this.windowMode!==windowModes.spectator){
            this.chat_ref_delete=this.chat_ref.onDisconnect();
            this.chat_ref_delete.remove();
          }
          break;
        case gameStates.waitingForPlayerChoices:
          //we get here cause we have both players waiting, so we need to display/redisplay
          //the chices for the user to pick again, also since both poeopler are here,
          //we'll cancel the chat_ref.disconnect cause we don't know who will disconnect first.
          if(this.windowMode!==windowModes.spectator){
            this.displayAllChoices();
            this.chat_ref_delete.cancel();
          }
          break;
        case gameStates.displayResults:
          //We'll display the turn results for a bit, then after a timeout, go on to next round
          this.computeResults();
          this.displayAllPicked();
          this.displayResults();
          setTimeout(function(){
              rps_game.nextRound();
            }, 5000);
          break;
        default:
          ;
      }
    }
  },

  checkPlayerState: function(plyr, playerRef) {
    console.log("Check Player State: Player "+plyr+" state= "+playerRef.state);
    console.log(this.player1.state);
    this.updateDisplayStats(plyr, playerRef)

    if(playerRef.state===playerStates.justLeft){
      this.cleanUpPlayerLeft(plyr, playerRef);
      playerRef.state=playerStates.none;
      return;
    }
    if(playerRef.state===playerStates.justJoined){
      this.initialDisplay(plyr, playerRef);
      playerRef.state=playerStates.picking;
    }

    if(!playerRef.joined){
      playerRef.state=playerStates.none;
      this.displayWaiting(plyr, playerRef);
    }
    else if(!playerRef.picked){
      playerRef.state=playerStates.picking;
      if(playerRef.mode===playerModes.player)
        this.displayPlayerChoices(plyr, playerRef);
    }
    else  {
      playerRef.state=playerStates.justPicked;
      this.displayPicked(plyr, playerRef);
    }

  },

  initialDisplay: function(plyr, playerRef) {
    $("#player"+plyr+"-name").text(playerRef.name);
    $("#player"+plyr+"-stats").removeClass("hidden");
    if(playerRef.mode===playerModes.player){
      $("#name-entry").addClass("hidden");
      $("#game-text").removeClass("hidden");
      $("#game-text-display").text("Welcome, "+playerRef.name+"! You are Player "+plyr)
    }
    this.updateDisplayStats(plyr, playerRef);
  },

  updateDisplayStats: function(plyr, playerRef) {
     $("#player"+plyr+"-wins").text(playerRef.wins);
     $("#player"+plyr+"-losses").text(playerRef.losses);
  },

  //called when slot is open
  displayWaiting: function(plyr, playerRef){
    $("#player"+plyr+"-stats").addClass("hidden");
    $("#player"+plyr+"-choices").addClass("hidden");
    $("#player"+plyr+"-name").text("Waiting for Player "+plyr);
  },

  displayAllChoices: function(){
    $("#player1-display").removeClass("hidden");
    $("#player2-display").removeClass("hidden");
  },

  displayPlayerChoices: function(plyr, playerRef) {
    if(!playerRef.picked && playerRef.mode===playerModes.player){
      $("#player"+plyr+"-selection").addClass("hidden");
      $("#player"+plyr+"-choices").removeClass("hidden");
    }
  },

  displayPicked: function(plyr, playerRef){
    $("#player"+plyr+"-selection-text").text(choiceArray[playerRef.choice]);
    if(playerRef.picked && playerRef.mode===playerModes.player){
      $("#player"+plyr+"-selection").removeClass("hidden");
      $("#player"+plyr+"-choices").addClass("hidden");
    }
  },

  displayAllPicked: function(){
    $("#player1-selection").removeClass("hidden");
    $("#player1-choices").addClass("hidden");
    $("#player2-selection").removeClass("hidden");
    $("#player2-choices").addClass("hidden");
  },

  updateResultText: function(str){
    $("#game-result").text(str);
  },

  displayResults: function() {
    $("#game-result").removeClass("hidden");
  },

  hideResults: function() {
    $("#game-result").addClass("hidden");
  },

  hideAllChoices: function(){
    $("#player1-selection").addClass("hidden");
    $("#player1-choices").addClass("hidden");
    $("#player2-selection").addClass("hidden");
    $("#player2-choices").addClass("hidden");
  },

  selectChoice: function(choice) {
    this.player.choice=choice;
    this.player.state=playerStates.justPicked;
    this.player_ref.set({name: this.player.name, choice: this.player.choice, wins: this.player.wins, losses: this.player.losses});
  },

  joinGame: function(myName) {
    if(!this.player1.joined){
      this.player=this.player1;
      this.player_ref=database.ref("player/1");
      this.enemy=this.player2;
      this.windowMode=windowModes.player1;
    } else if(!this.player2.joined){
      this.player=this.player2;
      this.player_ref=database.ref("player/2");
      this.enemy=this.player1;
      this.windowMode=windowModes.player2;
    } else {
      alert("Game is full, sorry");
    }

    if(this.player!==null){
      this.windowMode=windowModes.active;
      this.player.mode=playerModes.player;
      this.enemy.mode=playerModes.enemy;

      this.chat_ref_delete=this.chat_ref.onDisconnect();
      this.chat_ref_delete.remove();
      this.player_ref.onDisconnect().remove();

      //this.player.joined=true;
      //this.player.name=myName;
      this.player_ref.set({name: myName, choice: 0, wins: 0, losses: 0});

    }

  },

  //from child_added, meaning on first player created in database
  addPlayer: function(snapshot) {
    console.log("Add Player: Snapshot key = "+snapshot.key);
    if(snapshot.key==="1"){
      this.player1.state=playerStates.justJoined;
      this.checkPlayerState("1", this.player1);
    }
    else if(snapshot.key==="2"){
      this.player2.state=playerStates.justJoined;
      this.checkPlayerState("2", this.player2);
    }

  },

  removePlayer: function(snapshot) {

  },

  updatePlayer: function(snapshot) {
    var val=snapshot.val();
    var tempPlayer=null;
    if(snapshot.key==="1")
      tempPlayer=this.player1;
    else 
      tempPlayer=this.player2;

    tempPlayer.name=val.name;
    tempPlayer.choice=val.choice;
    if(val.choice!==0)
      tempPlayer.picked=true;
    else
      tempPlayer.picked=false;

    tempPlayer.wins=val.wins;
    tempPlayer.losses=val.losses;

    tempPlayer.joined=true;

    if(snapshot.key==="1")
      this.checkPlayerState("1", this.player1);
    else 
      this.checkPlayerState("2", this.player2);

    this.checkGameState();
  },


  sendMessage: function(message) {

  },

  addChatMessage: function(message) {

  }
};


$(document).ready(function(){

  rps_game.initialize();

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
      if(snapshot.val()!==null)
        rps_game.updatePlayer(snapshot);
    }, function(errObject){
      console.log("Errors handled: " + errObject.code);
  });
  database.ref("player/2").on("value", function(snapshot){
      if(snapshot.val()!==null)
        rps_game.updatePlayer(snapshot);
    }, function(errObject){
      console.log("Errors handled: " + errObject.code);
  });

  database.ref("chat").on("child_added", function(snapshot){
      rps_game.addChatMessage(snapshot.val().message);
    }, function(errObject){
      console.log("Errors handled: " + errObject.code);
  });


  console.log("Script loaded succsesfuly")

});
