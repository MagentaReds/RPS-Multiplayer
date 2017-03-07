//The Player object itself has virtual no logic in it and is really just a container of information
//The logic it does have is for jQuery editing the DOM, each member variable and method that stars with "jq" designates it as using jQuery
//jQuery is not used inside any other object method to keep things seperated.
function Player(name, num){
  //I could/should make these member variables private, but I access them driectly fairly often in my main game object, 
  //and making new methods to return/set the variables would take up space and would require a editing the rps_games code.
  this.playerNumber=num;
  this.name = name;
  this.choice = 0;
  this.wins  = 0;
  this.losses = 0;
  this.joined = false;
  this.picked = false;
  this.mode = playerModes.none;
  this.state = playerStates.none;

  this.jqWins=$("#player"+num+"-wins");
  this.jqLosses=$("#player"+num+"-losses");
  this.jqName=$("#player"+num+"-name");
  this.jqChoices=$("#player"+num+"-choices");
  this.jqDisplay=$("#player"+num+"-display");
  this.jqStats=$("#player"+num+"-stats");
  this.jqSelection=$("#player"+num+"-selection");
  this.jqSelectionText=$("#player"+num+"-selection-text");

  //Updates this player's wins and losses text
  this.jqUpdateStats = function() {
    this.jqWins.text(this.wins);
    this.jqLosses.text(this.losses);
  };
  //Called when a User first joins this player's slot.
  this.jqInitialDisplay = function() {
    this.jqName.text(this.name);
    this.jqDisplay.removeClass("hidden");
    this.jqChoices.addClass("hidden");
    this.jqHideSelection();
    this.jqStats.removeClass("hidden");
  };
  //If the player is this User's player, display their rps choice buttons
  this.jqDisplayChoices = function() {
    if(this.mode===playerModes.player){
      this.jqChoices.removeClass("hidden");
      this.jqHideSelection();
    }
  };
  //If the player is the User's player, display their what they have picked
  //if override is true, then display this player's pick even if they aren't the User's player
  this.jqDisplaySelection = function(override=false) {
    this.jqSelectionText.text(choiceArray[this.choice]);
    if(override || this.mode===playerModes.player) {
      this.jqChoices.addClass("hidden");
      this.jqSelection.removeClass("hidden"); 
    }
  };
  //Called when the player's slot is open
  //Hides eveyrthing needed to be hidden, and sets the Text to Waitin for Player X
  this.jqDisplayWaiting = function() {
    this.jqName.text("Waiting for Player "+this.playerNumber);
    this.jqChoices.addClass("hidden");
    this.jqStats.addClass("hidden");
    this.jqHideSelection();
  };
  //Hides the element that displays what the player has picked
  //Also cleans sets the text to "' just in case people view the element via inspector"
  this.jqHideSelection= function() {
    this.jqSelection.addClass("hidden");
    this.jqSelectionText.text("");
  };
}