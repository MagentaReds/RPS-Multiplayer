# RPS-Multiplayer

Anyone can play the game by accessing the same webpage.  By defualt, you are a spectator, but can join the game if you submit a name and a spot is available to become a player.
Only player's can use the chat.
Once both player slots are filled, the game begins, and each player on their own window is shown buttons to select their choice.
Players can leave at any time, and other windows opened to that same webpage are updated in real time to the game state.

Each window opened can see the chat history in real time, and if it exists in firebase when a user loads the page, it will fill in the history automatically.

Firebase cleanup:
  When a user joins as a player, that window makes the player entry in firebase.  And when that user closes the window, they removes the player's entry.
  If there is a remaining player when the a player leaves, the remaining player sends a message to firebase that the other has diconnected.
  When the last user player leaves, they delete the entire chat-history from firebase

Firebase Diagram
```
  chat:
    firebaseid1:
      message: "Message Text"
    firebaseid2:
      message: "Message Text Later"
  player:
    1:
      name: "player1 name"
      choice: 0
      wins: 0
      losses: 0
    2:
      name: "player2 name"
      choice: 0
      wins: 0
      losses: 0
```

Notes:
Most of the updates such as what each player has picked are updated in real time as they are sent to firebase, but the results of those changes are hidden behind CSS display: none's.

I could have used the Player.prototype more, as I only will make a new Player object twice.  Might have made some of my cleanup code when a player leaves a little easier/faster made new Player's and let javscript clean up old unreferenced objects.  But I decided to save some memory and edit the Player objects I already had.  Not really sure if matters much, as each Player object is small.