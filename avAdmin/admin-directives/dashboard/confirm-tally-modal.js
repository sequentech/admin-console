/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2015-2016  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-admin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-admin  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-admin.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avAdmin')
  .controller('ConfirmTallyModal',
    function($scope, $modalInstance, ConfigService, payload) {
      $scope.helpurl = ConfigService.helpUrl;
      $scope.election = payload;
      $scope.children_election_info = {
        presentation: { 
          categories: []
        }
      };

      if ($scope.election.children_election_info && $scope.election.children_tally_status) {
        var statusMap = {};
        _.each(
          $scope.election.children_tally_status,
          function (election) {
            statusMap[election.id] = election.tally_status;
          }
        );

        $scope.children_election_info = angular.copy($scope.election.children_election_info);
        _.each(
          $scope.children_election_info.presentation.categories,
          function (category) {
            _.each(
              category.events,
              function (event) {
                event.data = ('notstarted' === statusMap[event.event_id]);
              }
            );
          }
        );
      }

      $scope.census_dump_modes = [
        {
          name: 'all',
          enabled: false
        },
        {
          name: 'active',
          enabled: true
        }
      ];

      $scope.binding = {
        census_dump_mode: 'active'
      };

      $scope.ok = function () {
        var tallyElectionIds = [];
        _.each(
          $scope.children_election_info.presentation.categories,
          function (category) {
            _.each(
              category.events,
              function (event) {
                if (event.data) {
                  tallyElectionIds.push(event.event_id);
                }
              }
            );
          }
        );

        $modalInstance.close({
          mode: $scope.binding.census_dump_mode,
          tallyElectionIds: tallyElectionIds
        });
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
