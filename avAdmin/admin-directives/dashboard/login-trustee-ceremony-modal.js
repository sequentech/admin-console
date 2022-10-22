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
  .controller('LoginTrusteeCeremonyModal',
    function($scope, $modalInstance, ElectionsApi, data) {
      $scope.trusteeId = data.trusteeId;
      $scope.election = data.election;
      $scope.error = undefined;
      $scope.numSteps = data.numSteps;
      $scope.currentStep = data.currentStep;
      $scope.login_fields = [
        {
          "disabled": false,
          "max": 200,
          "min": 3,
          "name": "username",
          "required": true,
          "required_on_authentication": true,
          "type": "text",
          "unique": true,
        },
        {
          "disabled": false,
          "max": 200,
          "min": 3,
          "name": "password",
          "required": true,
          "required_on_authentication": true,
          "type": "password",
          "unique": true,
        }
      ];

      function getFieldValue(name) {
        var field = $scope.login_fields.find(function (field) { return field["name"] === name; });
        return field && field["value"];
      }

      $scope.login = function () {
        var username = getFieldValue("username");
        var password = getFieldValue("password");
        ElectionsApi.downloadPrivateKeyShare(
          $scope.election, $scope.trusteeId, username, password
        ).then(
          function (result)
          {
            $modalInstance.close($scope.login);
          }
        ).catch(
          function(error)
          {
            $scope.error = error.statusText;
          }
        );
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
