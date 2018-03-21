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

// Checks if the ballot boxes are available (do not exist) and if so, create
// them
angular.module('avAdmin')
  .controller(
    'CheckingBallotBoxModal',
    function(
      $scope,
      $modalInstance,
      election,
      textarea,
      ConfigService,
      Authmethod
    ) {
      $scope.election = election;
      $scope.boxNames = textarea.split("\n");
      $scope.existingBoxes = [];
      $scope.createdBoxes = [];
      $scope.errorCreatingBoxes = [];

      function createBallotBoxes()
      {
        $scope.state = "creating";
        _.each(
          $scope.boxNames,
          function(name)
          {
            Authmethod.createBallotBox($scope.election.id, name)
              .success(function (data) {
                $scope.createdBoxes.append(name);
                if ($scope.createdBoxes.length === $scope.boxNames.length) {
                  $scope.state = "success";
                }
              })
              .error(function (data) {
                $scope.errorCreatingBoxes.append(name);
              });
          }
        );
      }

      $scope.state = "checking-existing";
      Authmethod.getBallotBoxes(
        $scope.election.id,
        0,
        null,
        {name__in: $scope.boxNames.join("|")},
        null
      )
        .success(
          function(data)
          {
            if (data.total_count !== 0)
            {
              $scope.state = "has-existing";
              $scope.existingBoxes = data.object_list;
            } else {
              createBallotBoxes();
            }
          }
        )
        .error(
          function(data) {
            $scope.error = data;
          }
        );

      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close($scope.ballotboxes_input);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }
  );
