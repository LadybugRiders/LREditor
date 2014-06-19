'use strict';


// Declare app level module which depends on filters, and services
angular.module('LREditor', [
  'ngRoute',
  'LREditor.filters',
  'LREditor.services',
  'LREditor.directives',
  'LREditor.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeCtrl'});
  $routeProvider.otherwise({redirectTo: '/home'});
}]);
