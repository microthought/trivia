angular.module('app.user', ['app.services'])

.controller('HomeController', function($scope, $location, UserInfo, $rootScope, $timeout, $interval) {

  //length of round in seconds
  var roundLength = 7;

  //Passing data from the UserInfo factory
  $scope.user = UserInfo.user;
  $scope.rooms = UserInfo.rooms;
  $scope.currentRoom = UserInfo.currentRoom;
  $scope.activeUsers = [];
  $scope.newPlayer = {};

  console.log("user is: ", $scope.user);
  console.log("rooms is: ", $scope.rooms);
  console.log("currentRoom is: ", $scope.currentRoom);
  console.log("activeUsers is: ", $scope.activeUsers);
  console.log("newPlayer is: ", $scope.newPlayer);





  $scope.goToRoom = function(roomName) {
    $scope.currentRoom = UserInfo.getRoom(roomName);
  };

  $scope.addRoom = function(newRoomName) {
    UserInfo.addNewRoom(newRoomName);
    $scope.activeUsers.push($scope.user.username);
    $scope.clear();
  };

  $scope.clear = function() {
    $scope.newRoomName = '';
    $scope.newPlayer = {};
  }

  $scope.addPlayer = function(newPlayerUsername) {
    var roomname = $scope.currentRoom.roomname;
    UserInfo.addNewPlayer(roomname, newPlayerUsername);
    $scope.clear();
  };

  $scope.playerReady = function() {
    UserInfo.playerReady();
    $scope.weReady();
  };

  $scope.startGame = function() {
    UserInfo.startNewGame();
    console.log($scope.currentRoom);
  };

  $scope.weReady = function(){
    //Check to see if ALL players are ready
    var allReady = $scope.currentRoom.users.reduce((acc, cur) =>  (!!cur.ready || cur.username === $scope.user.username) && acc, true);

    console.log("YO! Are we ready??? ", allReady)
    if(allReady) {
      $scope.startGame();
    }

  };



  $scope.on = UserInfo.on;
  $scope.removeActiveUser = UserInfo.removeActiveUser
  $scope.invitedToNewRoom = UserInfo.invitedToNewRoom
  $scope.addActiveUser = UserInfo.addActiveUser


//SOCKET.IO EVENT LISTENNERS//
  $scope.on('PlayerAdded', function(room, newPlayerUsername) {
    //Making sure we are on the right user/socket before we update the view
    if ($scope.currentRoom.roomname === room.roomname) {
      $scope.currentRoom = UserInfo.currentRoom;
    }
    if (newPlayerUsername === UserInfo.user.username) {
      $scope.rooms[room.roomname] = UserInfo.addedToNewRoom(room);
    }

  });

  $scope.on('SendQuestions', function(questions) {
    console.log('questions', questions);
    $location.path('/home/game');
    $rootScope.questionSet = questions;
    $scope.startingGame();
  });

  $scope.on('newUserSignedUp', function(data) {
    console.log(data.username, ' got connected');
  });

  $scope.on('UserLeft', function(username) {
    console.log(username, ' has left the room');
    var index = $scope.activeUsers.indexOf(username);
    $scope.activeUsers.splice(index, 1);
    // $scope.removeActiveUser(username);
  });

 $scope.on('UserJoined', function(username, activeUsers) {
    if (username === $scope.user.username) {
      $scope.activeUsers = activeUsers;
      console.log(activeUsers, ' are in the room');
    } else {
      $scope.activeUsers.push(username);
      console.log(username, ' has joined the room');
    }
  });

  $scope.on('InvitetoNewRoom', function(roomInfo) {
    $scope.invitedToNewRoom(roomname);
  });

  $scope.on('UpdateScores', function() {
    UserInfo.updateAllScores();
  });

  function findIndexAtProp(arr, key, val) {
    for(var i in arr) {
      if(arr[i][key] === val) {
        return i;
      }
    }
    return null;
  }


  $scope.on('playerReady', function(username){
    $scope.currentRoom = UserInfo.currentRoom;
    console.log(username," is ready!!!");
    console.log('currentRoom', $scope.currentRoom);
    let index = findIndexAtProp($scope.currentRoom.users, 'username', username);
    $scope.currentRoom.users[index].ready = true;

  });


//////////////////////////////

/////GAME HAMDLING/////


  $scope.startingGame = function() {
    var roundDuration = roundLength * 1000;
    $scope.gameState = _resetGameState();
    var mathRandom = Math.random() * 1000;
    var timer = $interval(function() {
      if ($scope.gameState.timer === 1) {
        $scope.gameState.timer = roundLength;
      } else {
        $scope.gameState.timer -= 1;
      }
    }, 1000);

    $scope.on('correctAnswer', function(username) {
      if ($scope.user.username !== username) {
        _someoneElseGotCorrectAnswer();
      }
    });

//have to be nested, in order to get the questionSet first
    // UserInfo.playGame(handleRoundEnd, handleGameEnd);

//function is called at the end of every round
    function handleRoundEnd(callback) {
      $scope.gameState.questionsAttempted++;
      $scope.gameState.isCorrect = 'pending';
      callback();
    }

//function is called at the end of every game
    function handleGameEnd() {
      $scope.gameState.isCorrect = 'pending';
      $interval.cancel(timer);
      $timeout(function() {
        UserInfo.sendScore($scope.gameState.numCorrect * 100);
        console.log('mathRandom: ', mathRandom);
      }, mathRandom);
    }

//resets the game state to the initial values. called at the start of every game
    function _resetGameState() {
      return {
        index: -1,
        isCorrect: 'pending',
        numCorrect: 0,
        questionsAttempted: 1,
        gameFinished: false,
        timer: roundLength
      };
    }

    function _someoneElseGotCorrectAnswer() {
      console.log('You got jacked, SON!');
    }

    function _startTimer(roundDuration) {
      $timeout(function() {
        handleRoundEnd(gameStart);

        if ($scope.gameState.questionsAttempted === 11) {
          $scope.gameState.gameFinished = true;
        }

      }, roundDuration);
    }

    function gameStart() {
      if ($scope.gameState.questionsAttempted < 11) {
        _startTimer(roundDuration);
      } else {
        handleGameEnd();
      }
    }
    gameStart();
    _someoneElseGotCorrectAnswer();
  };

//when user submits an answer, checks to see if it is the right answer.
  $scope.submitAnswer = function() {
    var questionIndex = $scope.gameState.questionsAttempted - 1;
    var activeQuestion = $rootScope.questionSet[questionIndex];
    var isCorrect = activeQuestion.answerChoices[$scope.gameState.index] === activeQuestion.correct_answer;

    if (isCorrect) {
      $scope.gameState.numCorrect++;
      $scope.gameState.isCorrect = 'yes';
      UserInfo.correctAnswer($scope.user.username, $scope.currentRoom.roomname);
    } else {
      $scope.gameState.isCorrect = 'no';
    }


    $scope.clear();
  };

///////////////////////

});











