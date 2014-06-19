'use strict';


// Declare app level module which depends on filters, and services
angular.module('Loopy', [
  'ngRoute',
  'Loopy.filters',
  'Loopy.services',
  'Loopy.directives',
  'Loopy.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
  $routeProvider.otherwise({redirectTo: '/home'});
}]);
