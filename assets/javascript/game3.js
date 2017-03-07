//main game object and logic
//Like the player object, each member variable and method that stars with "jq" designates it as using jQuery
//jQuery is not used inside any other object method to keep things seperated.
var rps_game = {
  player1: null,
  player2: null,
  player: null,
  enemy: null,
  player_ref: null,
  chat_ref: database.ref("chat"),
  chat_ref_delete: null,
  lastGameState: gameStates.waitingForPlayers,
  gameState: gameStates.waitingForPlayers,
  windowMode: windowModes.spectator,

  //set/reset the game
  initialize: function(){
    this.player1= new Player("", 1);
    this.player2= new Player("", 2);

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

  //Compares player1's and player2's picks, to determine a winner
  computeResults: function(){
    var result=this.player1.choice-this.player2.choice;
    if(result<0)
      result+=3;
    if(result===0){
      this.jqUpdateResultText("Tied!");
    }
    else if(result===1) {
      this.jqUpdateResultText(this.player1.name+" Wins!");
      this.player1.wins++;
      this.player2.losses++;
    }
    else{
      this.jqUpdateResultText(this.player2.name+" Wins!")
      this.player2.wins++;
      this.player1.losses++;
    }

  },

  //After the results have been displayed, move on to the next round
  nextRound: function() {

    this.jqHideResults();
    this.player1.jqHideSelection();
    this.player2.jqHideSelection();
    this.player1.picked=false;
    this.player2.picked=false;
    this.player1.choice=0;
    this.player2.choice=0;
    //this.gameState=gameStates.displayResults;

    if(this.player1.joined)
      database.ref("player/1").set({name: this.player1.name, choice: 0, wins: this.player1.wins, losses: this.player1.losses});
    if(this.player2.joined)
      database.ref("player/2").set({name: this.player2.name, choice: 0, wins: this.player2.wins, losses: this.player2.losses});
    
  },

  //Checks the gamestate as it is currently, then calls changeGameState helper function to do logic based on the gamestate.
  //This is called everytime rps_game get's an update from Firebase for one of the players.
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

    //console.log("Check games state tempGameState="+tempGameState);
    this.changeGameState(tempGameState);
  },

  //If the gameState that was sent from checkGameState is different than the previous gameState, then we change to that new gameState.
  //Do stuff based on new gameState
  changeGameState: function(state){
    if(state!==this.gameState){
      this.lastGameState=this.gameState;
      this.gameState=state;
      //console.log(this.lastGameState +" ++TO++ "+this.gameState);

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
            //this.jqDisplayAllChoices();
            this.checkPlayerState("1", this.player1);
            this.checkPlayerState("2", this.player2);
            if(this.chat_ref_delete!==null){
              this.chat_ref_delete.cancel();
              this.chat_ref_delete=null;
            }
          }
          break;
        case gameStates.displayResults:
          //We'll display the turn results for a bit, then after a timeout, go on to next round
          this.computeResults();
          this.jqDisplayAllPicked();
          this.jqDisplayResults();
          setTimeout(function(){
              rps_game.nextRound();
            }, 3000);
          break;
        default:
          ;
      }
    }
  },

  //Checks the player state of the given player and does logic based on what it is.
  //This is called everytime this player's firebase data is changed, so we need to make our local data match firebase's
  checkPlayerState: function(plyr, playerRef) {
    //console.log("Check Player State: Player "+plyr+" state= "+playerRef.state);
    playerRef.jqUpdateStats();

    if(playerRef.state===playerStates.justLeft){
      this.cleanUpPlayerLeft(plyr, playerRef);
      playerRef.state=playerStates.none;
      return;
    }
    if(playerRef.state===playerStates.justJoined){
      playerRef.jqInitialDisplay();
      playerRef.state=playerStates.picking;
    }

    if(!playerRef.joined){
      playerRef.state=playerStates.none;
      playerRef.jqDisplayWaiting();
    }
    else if(!playerRef.picked){
      playerRef.state=playerStates.picking;
      if(this.gameState===gameStates.waitingForPlayerChoices)
        playerRef.jqDisplayChoices();
    }
    else  {
      playerRef.state=playerStates.justPicked;
      if(this.windowMode!==windowModes.spectator)
        playerRef.jqDisplaySelection();
    }

  },

  //Display each player's Choice
  jqDisplayAllPicked: function(){
    this.player1.jqDisplaySelection(true);
    this.player2.jqDisplaySelection(true);
  },
  //Changes game-result text.
  jqUpdateResultText: function(str){
    $("#game-result").text(str);
  },
  //Unhides the game-result element
  jqDisplayResults: function() {
    $("#game-result").removeClass("hidden");
  },
  //Rehides the game-result element
  jqHideResults: function() {
    $("#game-result").addClass("hidden");
  },
  //Hide's all player's choice buttons
  jqHideAllSelections: function(){
    $("#player1-selection").addClass("hidden");
    $("#player2-selection").addClass("hidden");
  },
  //Hides name entry form, and displays joined message at top of page
  jqJoinGameDisplay: function(){
    $("#name-entry").addClass("hidden");
    $("#game-text-display").text("Welcome "+this.player.name+"!  You are Player "+this.player.playerNumber+".");
    $("#game-text").removeClass("hidden");
  },
  //This page's User has selected a choice.
  selectChoice: function(choice) {
    this.player.choice=choice;
    this.player.state=playerStates.justPicked;
    this.player_ref.set({name: this.player.name, choice: this.player.choice, wins: this.player.wins, losses: this.player.losses});
  },
  //This page's User has eneterd a name to join the game
  //If player1 is already taken, Join as player 2, if both are taken, alert that the game is full.
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
      this.chat_ref.push({message: myName+" has connected"});
      this.jqJoinGameDisplay();

    }

  },

  //called via Firebase on("child_added"), add's the player that has joined
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
  //called from Firebase on("child_removed"), cleans up player's state
  //sets the gameState to waitingForPlayers
  removePlayer: function(snapshot) {
    var leavingPlayer=null;
    var stayingPlayer=null;
    if(snapshot.key==="1"){
      leavingPlayer=this.player1;
      stayingPlayer=this.player2;
    }
    else{
      leavingPlayer=this.player2;
      stayingPlayer=this.player1;
    }

    //If this window is set as the other Active player
    if(this.windowMode!==windowModes.spectator) {
      var tempStr= leavingPlayer.name+" has disconnected";
      this.chat_ref.push({message: tempStr});
      //Rebind chat_ref_delete to this player, since they are the last one, if they aren't already set to delete the chat on disconnect.
      if(this.chat_ref_delete===null) {
        this.chat_ref_delete=this.chat_ref.onDisconnect();
        this.chat_ref_delete.remove();
      }
      //set player's choice to 0 in firebase.
      this.player_ref.set({name: this.player.name, choice: 0, wins: this.player.wins, losses: this.player.losses});
    }


    leavingPlayer.name="";
    leavingPlayer.choice=0;
    leavingPlayer.picked=false;
    leavingPlayer.joined=false;
    leavingPlayer.jqDisplayWaiting();
    stayingPlayer.jqInitialDisplay();
    this.gameState=gameStates.waitingForPlayers;

    this.checkPlayerState("1", this.player1);
    this.checkPlayerState("2", this.player2);

  },
  //Called via Firebase .on("value"), updates that player stats
  updatePlayer: function(snapshot) {
    var val=snapshot.val();
    var tempPlayer=null;
    if(snapshot.key==="1")
      tempPlayer=this.player1;
    else 
      tempPlayer=this.player2;

    tempPlayer.name=val.name;
    tempPlayer.choice=val.choice;
    if(val.choice===0)
      tempPlayer.picked=false;
    else
      tempPlayer.picked=true;

    tempPlayer.wins=val.wins;
    tempPlayer.losses=val.losses;

    tempPlayer.joined=true;

    if(snapshot.key==="1")
      this.checkPlayerState("1", this.player1);
    else 
      this.checkPlayerState("2", this.player2);

    this.checkGameState();
  },


  //called via firebase listener on(child_added) for ref(chat)
  jqAddChatMessage: function(message){
    var mess=$("<p>");
    mess.html(message);

    var chatBox=$("#chat-box");
    chatBox.append(mess);


    chatBox.scrollTop(chatBox[0].scrollHeight);
   
  },

  //called when Send is pressed on the page, only sends the message if that window is an active player.
  sendMessage: function(myMessage) {
    if(this.player!==null){
      var temp= this.player.name+": "+myMessage;
      this.chat_ref.push({message: temp});
    }
  }
};


