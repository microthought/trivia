angular.module('app.auth', ['app.services'])


.controller('AuthController', function($scope, $window, UserInfo, $location, $cookies) {

  $scope.user = {};

  //Hacky test for authentication without logout button
  $cookies.put('username', '');

  $scope.signIn = function() {
    UserInfo.signIn($scope.user);
    //TODO: SEND signin info to server to check if user exists; if so, check if passwords is correct.
  };

  $scope.signUp = function() {
    UserInfo.signUp($scope.user)
    // .then(function (token) {
    //   $window.localStorage.setItem('com.trivia', token);
    //   $location.path('api/home/profile');
    // })
    // .catch(function(error) {
    //   console.log(error);
    // });
    //TODO: SEND signin info to server to check if user exists; if so, check if passwords is correct.
  };

});
