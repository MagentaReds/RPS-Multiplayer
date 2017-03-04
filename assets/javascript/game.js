//My Global variables
var playerNum = 0; //will either be 0,1,or 2 depending on game state
var playerName=""; //
var lastChoice=-1;
const choiceArray = ["None", "Rock", "Paper", "Scissors"];  //0, 1, 2 for R,P,S for choices.
var wins=-1;
var losses=-1;
var turns=-1;

const gameStates={
  waitingForPlayers: "Waiting for all players to join", 
  readyToStartGame: "Every one is here, time to start!",
  waitingForPlayerChoices: "Waiting for all players to pick a move", 
  displayResults: "Results of the round are being display",
  playerHasDisconnected: "One of the players has disconnected, waiting for another player",
  gameLoaded: "The game has loaded"
};

const playerMode={
  none: "none",
  one: "player1",
  two: "player2",
  spectator: "spectator"
};

var chatListener=null;
var playersListener=null;
var player1Listener=null;
var player2Listener=null;

var numberOfPlayers=0;

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
  name: null,
  player: playerMode.spectator,
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
  player_ref: null,
  chat_ref: database.ref("chat"),
  chat_ref_delete: null,
  choice: 0,
  lastGameState: gameStates.waitingForPlayers,
  gameState: gameStates.waitingForPlayers,

  //called with a snapshot of the root in firebase
  //set's player to -1 (spectator) if both players are already taken up
  //fills in chat box if there is a history already
  initialize: function(){

  },

  displayChoices: function(){
    var playerStr=this.player;
    $("#"+playerStr+"-display").removeClass("hidden");
  },

  changeGameState: function(state){
    if(state!==this.gameState){
      this.lastGameState=this.gameState;
      this.gameState=state;
      console.log(this.lastGameState +"++TO++"+this.gameState);

      switch(state) {
        case gameStates.waitingForPlayers: //we get here because We were probably waiting for playerchoices, so we need to clean up the board of then player who left
          //the removePlayer function already does most of this work
          //but we need to set us to remove the chat if we also disconnect
          if(this.player!==playerMode.spectator){
            this.chat_ref_delete=this.chat_ref.onDisconnect();
            this.chat_ref_delete.remove();
          }
          break;
        case gameStates.waitingForPlayerChoices:
          //we get here cause we have both players waiting, so we need to display/redisplay
          //the chices for the user to pick again, also since both poeopler are here,
          //we'll cancel the chat_ref.disconnect cause we don't know who will disconnect first.
          if(this.player!==playerMode.spectator){
            this.displayChoices();
            this.chat_ref_delete.cancel();
          }
          break;
        case gameStates.displayResults:
          //We'll display the turn results for a bit, then after a timeout, go on to next round
          this.displayResults();
          break;
        default:
          ;
      }
    }

  },

  checkGameState: function(){
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

  //set up page for spectator view
  spectatorSetup: function() {
    this.player=playerMode.spectator;
    $("#name-entry").addClass("hidden");
  },

  //waiting for player to submit a name
  playerSetup: function(playerNum) {

  },

  displayPlayer: function(whichPlayer){
    var temp=null;
    var playerStr=null;

    if(whichPlayer===playerMode.one){
      temp=this.player1;
      playerStr="player1";
    }
    else {
      temp=this.player2;
      playerStr="player2";
    }

    $("#"+playerStr+"-name").text(temp.name);
    $("#"+playerStr+"-stats").removeClass("hidden");
    $("#"+playerStr+"-wins").text(temp.wins);
    $("#"+playerStr+"-losses").text(temp.losses);

  },

  hidePlayer: function(whichPlayer) {
    var temp=null;
    var playerStr=null;

    if(whichPlayer===playerMode.one){
      temp=this.player1;
      playerStr="player1";
    }
    else {
      temp=this.player2;
      playerStr="player2";
    }

    $("#"+playerStr+"-name").text("Waiting for "+playerStr);
    $("#"+playerStr+"-stats").addClass("hidden");
  },

  displayYouJoined: function(){
    $("#name-entry").addClass("hidden");
    $("#game-text").removeClass("hidden");
    $("#game-text-display").text("Welcome, "+this.name+"! You are "+this.player);

    this.displayPlayer(this.player);
  },

  //called when person submits their name
  joinGame: function(nameNew) {
    //console.log(nameNew);
    if(this.player1.joined===false) {
      this.player=playerMode.one;
      this.player1.joined = true;
      this.name=nameNew;

      this.chat_ref_delete=this.chat_ref.onDisconnect();
      this.chat_ref_delete.remove();

      this.player_ref=database.ref("player/1");
      this.player_ref.set({name: nameNew, choice: "None", wins: 0, losses: 0});
      var quitStr=nameNew+" has disconnected.";
      this.player_ref.onDisconnect().remove();
    }
    else if(this.player2.joined===false) {
      this.player=playerMode.two;
      this.player2.joined = true;
      this.name=nameNew;

      this.chat_ref_delete=this.chat_ref.onDisconnect();
      this.chat_ref_delete.remove();

      this.player_ref=database.ref("player/2");
      this.player_ref.set({name: nameNew, choice: "None", wins: 0, losses: 0});
      var quitStr=nameNew+" has disconnected.";
      this.player_ref.onDisconnect().remove();
    }
    else {
      alert("Game is full, sorry");
    }



    this.displayYouJoined();
    this.checkGameState();

  },

  addPlayer: function(snapshot){
    var temp=null;
    var playerwhich= null;
    if(snapshot.key==="1"){
      temp=this.player1; 
      playerwhich=playerMode.one;
    }
    else {
      temp=this.player2;
      playerwhich=playerMode.two;
    }

    temp.joined=true;
    temp.name=snapshot.val().name;
    temp.losses=snapshot.val().losses;
    temp.wins=snapshot.val().wins;
    this.displayPlayer(playerwhich);

    console.log("Player1.joined: "+this.player1.joined+" Player2.joined: "+this.player2.joined);

    this.checkGameState();
  },

  removePlayer: function(snapshot) {
    var temp=null;
    var playerwhich= null;

    if(snapshot.key==="1"){
      temp=this.player1; 
      playerwhich=playerMode.one;
    }
    else {
      temp=this.player2;
      playerwhich=playerMode.two;
    }

    if(this.player!==playerMode.spectator) {
      var quitStr=temp.name+" has disconnected";
      this.chat_ref.push({message: quitStr});
    }

    temp.joined=false;
    temp.name="";
    temp.losses=0;
    temp.wins=0;
    this.hidePlayer(playerwhich);

    this.checkGameState();
  },

  selectChoice: function(choiceNum) {
    var tempPlayer=null;
    if(this.player===playerMode.one)
      tempPlayer=this.player1;
    else
      tempPlayer=this.player2;

    tempPlayer.choice=choiceNum;
    tempPlayer.picked=true;

    $("#"+this.player+"-choices").addClass("hidden");
    $("#"+this.player+"-selection").removeClass("hidden");

    var tempObject = {
      name: tempPlayer.name,
      choice: tempPlayer.choice,
      wins: tempPlayer.wins,
      losses: tempPlayer.losses
    };
    this.player_ref.set(tempObject);

    this.checkGameState();
  },

  updatePlayerInfo: function(player, val) {
    var tempPlayer=null;
    if(player===1)
      tempPlayer=this.player1;
    else
      tempPlayer=this.player2;

    tempPlayer.name=val.name;
    tempPlayer.choice=val.choice;
    tempPlayer.wins=val.wins;
    tempPlayer.losses=val.losses;

    this.checkGameState();

  },

  updatePlayerDisplay: function(player){
    var tempPlayer=null;
    var playerStr=null;

    if(player===1) {
      tempPlayer=this.player1;
      playerStr=playerMode.one;
    }
    else {
      tempPlayer=this.player2;
      playerStr=playerMode.two;
    }

    $("#"+playerStr+"-name").text(tempPlayer.name);
    $("#"+playerStr+"--selection-text").text(choiceArray[tempPlayer.choice]);
    $("#"+playerStr+"-wins").text(tempPlayer.wins);
    $("#"+playerStr+"-losses").text(tempPlayer.losses);


  },

  updatePlayerJoined: function(snapshot){
    if(snapshot.child("1").exists()) {
      this.player1.joined=true;
      this.updatePlayerDisplay(1);
    }
    else if(snapshot.child("2").exists()) {
      this.player2.joined=true;
      this.updatePlayerDisplay(2);
    }

    this.checkGameState();
  },

  //called via firebase listener on(value) for ref(player/1)
  updatePlayer1: function(snapshot){
    this.updatePlayerInfo(1, snapshot.val());
    this.updatePlayerDisplay(1);
  },

  //called via firebase listener on(value) for ref(player/2)
  updatePlayer2: function(snapshot){
    this.updatePlayerInfo(2, snapshot.val());
    this.updatePlayerDisplay(2);
  },

  //called via firebase listener on(child_added) for ref(chat)
  addChatMessage: function(message){
    var mess=$("<p>");
    mess.html(message);

    var chatBox=$("#chat-box");
    chatBox.append(mess);


    chatBox.scrollTop(chatBox[0].scrollHeight);
   
  },

  //called when Send is
  sendMessage: function(myMessage) {
    if(this.name!==null){
      var temp= this.name+": "+myMessage;
      this.chat_ref.push({message: temp});
    }
  }



};


function tests() {
  console.log("Testing");

  database.ref("player/1").set({name:"bob", choice:"none", wins:0, losses:0});
  database.ref("player/2").set({name:"WINRAR", choice:"none", wins:0, losses:0});

  database.ref("player").once("value", function(snapshot){
      console.log(snapshot.child("3").exists());
      console.log(snapshot.child("1").val().name);
    }, function(errObject){
      console.log(errObject);
  });

  /*  Delete ref on page disconenct, these lines work the same
  database.ref("player/1").onDisconnect().set({Player1:null});
  database.ref("player/2").onDisconnect().set(null);
  database.ref("player/2").onDisconnect().remove();
  */
}


//Initial settup and function calls once page is loaded/ready
$(document).ready(function(){

  $(".player-choice").on("click", function(event){
    console.log("WE BEING CLICKED");
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
