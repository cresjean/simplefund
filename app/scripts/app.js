'use strict';

/**
 * @ngdoc overview
 * @name shareMarketApp
 * @description
 * # shareMarketApp
 *
 * Main module of the application.
 */
angular
  .module('shareMarketApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
        'ui.router',
        'ui.bootstrap',
        'ui.select'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state('calculator', {
                abstract : true,
                template: '<ui-view/>',
                controller: function($scope){
                    $scope.fund = {};
                }
          })
          .state('calculator.input', {
                url: "/",
                templateUrl: 'views/main.html',
                controller: 'MainCtrl',
                resolve: {
                    shares: function($resource){
                        var share = $resource('api/shares');
                        return share.get().$promise;

                    }
                }
          })
            .state('calculator.result', {
                url: "^/:share_code/result",
                templateUrl: 'views/result.html',
                controller: 'CalculatorCtrl',
                resolve: {
                    prices: function($resource, $stateParams){
                        var prices = $resource('api/share/:share_code/price', {share_code: $stateParams.share_code});
                        return prices.get().$promise;
                    }
                }
            })
        ;
  });
