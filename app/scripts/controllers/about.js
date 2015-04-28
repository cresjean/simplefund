'use strict';

/**
 * @ngdoc function
 * @name shareMarketApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the shareMarketApp
 */
angular.module('shareMarketApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
