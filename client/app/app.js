angular.module('app', ['app.auth', 'app.user', 'app.profile', 'ngFileUpload', 'ui.router'])

.controller('appController', function($scope, $location, $cookies){
  $scope.$on('$stateChangeStart', function(event, newUrl){
    console.log($cookies.get('username'));
    if(newUrl.requireAuth && ($cookies.get('username') === '' || $cookies.get('username') === undefined)){
      alert("Must Login First!");
      $location.path('/signin');
    }
  })
})

.config(function($stateProvider, $httpProvider) {

  $stateProvider
  .state('signinState', {
    url: '/signin',
    templateUrl: 'app/auth/signin.html',
    controller: 'AuthController'
  })
  .state('signupState', {
    url: '/signup',
    templateUrl: 'app/auth/signup.html',
    controller: 'AuthController'
  })
  .state('homeState', {
    url: '/home',
    abstract: true,
    templateUrl: 'app/user/home.html',
    controller: 'HomeController',
    requireAuth: true
  })
  .state('homeState.profile', {
    url: '/profile',
    templateUrl: 'app/user/home.profile.html',
    controller: 'ProfileController',
    requireAuth: true
  })
  .state('homeState.room', {
    url: '/room/:roomname',
    templateUrl: 'app/user/home.room.html',
    controller: 'HomeController',
    requireAuth: true
  })
  .state('homeState.game', {
    url: '/game',
    templateUrl: 'app/user/home.game.html',
    controller: 'HomeController',
    requireAuth: true
  })
  .state('otherwise', {
    url: '*path',
    templateUrl: 'app/auth/signin.html',
    controller: 'AuthController'
  });

  // $httpProvider.interceptors.push('AttachTokens');

})

// Workaround for "unhandled rejection" inherent to Angular 1.6.0 with ui-router
.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);;
// .factory('AttachTokens', function($window) {

//   var attach = {
//     request: function(object) {
//       var jwt = $window.localStorage.getItem('com.trivia');
//       if (jwt) {
//         object.headers['x-access-token'] = jwt;
//       }
//       object.headers['Allow-Control-Allow-Origin'] = '*';
//       return object;
//     }
//   };
//   return attach;
// }).run(function($rootScope, $location, UserInfo) {

//   $rootScope.$on('$stateChandeStart', function(event, next, current) {
//     if (next.$$state && next.$$state.authenticate &&)
//   })

// });
