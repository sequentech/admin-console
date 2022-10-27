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
  .controller('DeleteShareCeremonyModal',
    function($scope, $modalInstance, ElectionsApi, Base64Codec, data) {
      $scope.trusteeId = data.trusteeId;
      $scope.username = data.username;
      $scope.password = data.password;
      $scope.numSteps = data.numSteps;
      $scope.currentStep = data.currentStep;
      $scope.election = data.election;
      $scope.privateKeyShareFile = data.privateKeyShareFile;
      $scope.showSuccess = false;

      $scope.deletePrivateKeyShare = function () {
        Base64Codec.fileToBase64($scope.privateKeyShareFile)
        .then(function (fileBase64) {
          ElectionsApi.deletePrivateKeyShare(
            $scope.election, $scope.trusteeId, $scope.username, $scope.password, fileBase64
          ).then(
            function (result)
            {
              if (200 === result.status) {
                $scope.showSuccess = true;
              } else {
                $scope.error = result.statusText;
              }
            }
          ).catch(
            function (error)
            {
              $scope.error = error.statusText;
            }
          );
        });
      };

      $scope.next = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
