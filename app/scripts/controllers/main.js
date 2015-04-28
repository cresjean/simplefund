'use strict';

/**
 * @ngdoc function
 * @name shareMarketApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the shareMarketApp
 */
angular.module('shareMarketApp')
  .controller('MainCtrl', function ($scope, $log, $resource, shares) {
        $log.debug("MainCtrl");
        //var share = $resource('api/share/:share_id', {share_id:'@id'});
        //var share = $resource('api/shares');
        $scope.disabled = undefined;
        $scope.fund_availiable = [];
        $scope.index_funds = shares.response.index;
        $scope.data_funds = shares.response.data;
        $scope.enable = function() {
            $scope.disabled = false;
        };

        $scope.disable = function() {
            $scope.disabled = true;
        };

        $scope.clear = function() {
            $scope.fund.selected = undefined;
        };

        $scope.clear_all = function() {
            $scope.fund = {};

        };

        $scope.refreshFunds = function(fund_q) {
            if (fund_q === '')
            {
                $scope.fund_availiable = [];
            }
            else
            {
                $scope.fund_availiable = [];
                for (var key in $scope.index_funds) {
                    if (key.indexOf(fund_q) >= 0) {
                        $scope.fund_availiable.push($scope.data_funds[$scope.index_funds[key]]);
                    }
                }
            }

          };

        $scope.open = function($event, field) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = {};
            $scope.opened[field] = true;
          };


        $scope.formats = ['yyyy-MM-dd'];
        $scope.format = $scope.formats[0];

        $scope.$watch('fund.dt_started', function(newValue){
            if(newValue === undefined || newValue === null) return;
                $scope.min_release_date = newValue;
          });
  })
    .controller('CalculatorCtrl', function($scope, $log, prices, $state){
        if ($scope.fund.dt_released == undefined)
        {
            $state.go('^.input');
        }
        else
        {
            $scope.holding = Math.round($scope.fund.buy_amount / (1 + $scope.fund.buy_rate) * 100) / 100;
            var oneDay = 24*60*60*1000;

            $scope.holding_days = Math.round(Math.abs(($scope.fund.dt_released.getTime() - $scope.fund.dt_started.getTime())/(oneDay)));

            $scope.prices = prices;
            var chart = c3.generate({
                bindto: '#chart',
                data: {
                  columns: [
                    ['data1', 30, 200, 100, 400, 150, 250],
                    ['data2', 50, 20, 10, 40, 15, 25]
                  ]
                }
            });
            prices.response.forEach(function (p){
                var p_date = new Date(p['date']);

                if ($scope.fund.dt_released.getDate() === p_date.getDate()
                    && $scope.fund.dt_released.getMonth() === p_date.getMonth()
                    && $scope.fund.dt_released.getFullYear() === p_date.getFullYear())
                {
                    $log.debug("%s - %s", p_date, $scope.fund.dt_released);
                    $scope.final_amount = Math.round($scope.holding * p.price * (1 - $scope.fund.sell_rate/100));
                    $scope.final_profit = Math.round($scope.final_amount * (1 - $scope.fund.sell_rate/100) - $scope.fund.buy_amount);
                    $scope.final_profit_ratio = Math.round(100 * $scope.final_amount / $scope.fund.buy_amount - 1) / 100;
                    $scope.final_yearly_profit_ratio = Math.round(100 * $scope.final_profit_ratio/$scope.holding_days * 365) / 100;
                }
                else
                {

                }
            });
        }
    });
