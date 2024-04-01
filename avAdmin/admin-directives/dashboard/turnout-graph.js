/**
 * This file is part of admin-console.
 * Copyright (C) 2022 Sequent Tech Inc <legal@sequentech.io>

 * admin-console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * admin-console  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with admin-console.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avAdmin')
  .directive('avTurnoutGraph',
    function(
      $q,
      $window,
      $state,
      Authmethod,
      Plugins,
      ElectionsApi,
      $stateParams,
      $timeout
    ) {
      function link(scope, element, attrs) {
        function updateTurnoutData() {
          Authmethod.getTurnout(scope.election.id)
          .then(function (response){
          });
        }
        var labels = ["January", "February", "March", "April", "May", "June", "July"];
        var series = ['Series A', 'Series B'];
        var data = [
          [65, 59, 80, 81, 56, 55, 40],
          [28, 48, 40, 19, 86, 27, 90]
        ];
        var onClick = function (points, evt) {
          console.log(points, evt);
        };
        
        // Simulate async data update
        $timeout(function () {
          scope.data = [
            [28, 48, 40, 19, 86, 27, 90],
            [65, 59, 80, 81, 56, 55, 40]
          ];
        }, 3000);
        angular.extend(scope, {
          labels: labels,
          series: series,
          data: data,
          onClick: onClick,
          updateTurnoutData, updateTurnoutData
        });

        updateTurnoutData();
      }

      return {
        restrict: 'AE',
        scope: true,
        link: link,
        templateUrl: 'avAdmin/admin-directives/dashboard/turnout-graph.html'
      };
    });
  
