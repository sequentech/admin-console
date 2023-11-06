/**
 * This file is part of admin-console.
 * Copyright (C) 2015-2016  Sequent Tech Inc <legal@sequentech.io>

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
  .controller('AddPersonModal',
    function($scope, $modalInstance, election, newcensus, ConfigService) {
      $scope.election = election;
      $scope.verifyCensus = true;
      $scope.newcensus = newcensus;
      $scope.helpurl = ConfigService.helpUrl;
      $scope.children_election_info = angular.copy($scope.election.children_election_info);

      $scope.ok = function () {
        for (var i = 0; i < election.census.extra_fields.length; i++) {
          var field = election.census.extra_fields[i];
          if(!newcensus.hasOwnProperty(field.name)) {
            if (field.type === 'date') {
              newcensus[field.name] = field.value;
            } 
          } else {
            if (field.type === 'int') {
              newcensus[field.name] = parseInt(newcensus[field.name], 10);
            }
          }
        }

        if ($scope.children_election_info) {
          _.each(
            $scope.children_election_info.presentation.categories,
            function (category) {
              _.each(
                category.events,
                function (election) {
                  newcensus[election.event_id] = election.data ? "true" : "false";
                }
              );
            }
          );
        }
        $modalInstance.close($scope.verifyCensus);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
