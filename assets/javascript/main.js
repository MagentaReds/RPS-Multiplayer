$(document).ready(function(){
  //game object first initialize, probably not needed to be called here since.
  rps_game.initialize();

  //Listener for when a player picks clicks their Rock/Paper/Scissorcs button
  $(".player-choice").on("click", function(event){
    rps_game.selectChoice($(this).attr("data-choice"));
  });

  //Listener for when a player enters a name to join the game
  $("#submit-name").on("click", function(event){
    event.preventDefault();
    rps_game.joinGame($("#name-input").val().trim());
  });

  //Listener for when a player in the game sends a message
  $("#send-message").on("click", function(event){
    event.preventDefault();
    rps_game.sendMessage($("#chat-message").val().trim());
    $("#chat-message").val("");
  });


  //Firebase Listeners
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
      rps_game.jqAddChatMessage(snapshot.val().message);
    }, function(errObject){
      console.log("Errors handled: " + errObject.code);
  });

});

//console.log("All scripts loaded succsesfuly");