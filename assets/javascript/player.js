function player(name, num){
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

  this.jqUpdateStats = function() {
    this.jqWins.text(this.wins);
    this.jqLosses.text(this.losses);
  };
  this.jqInitialDisplay = function() {
    this.jqName.text(this.name);
    this.jqDisplay.removeClass("hidden");
    this.jqChoices.addClass("hidden");
    this.jqSelection.addClass("hidden");
    this.jqStats.removeClass("hidden");
  };
  this.jqDisplayChoices = function() {
    if(this.mode===playerModes.player){
      this.jqChoices.removeClass("hidden");
      this.jqSelection.addClass("hidden"); 
    }
  };
  this.jqDisplaySelection = function(override=false) {
    this.jqSelectionText.text(choiceArray[this.choice]);
    if(override || this.mode===playerModes.player) {
      this.jqChoices.addClass("hidden");
      this.jqSelection.removeClass("hidden"); 
    }
  };
  this.jqDisplayWaiting = function() {
    this.jqName.text("Waiting for Player "+this.playerNumber);
    this.jqChoices.addClass("hidden");
    this.jqSelection.addClass("hidden");
    this.jqStats.addClass("hidden");
  };
  this.jqHideSelection= function() {
    this.jqSelection.addClass("hidden");
  };
}