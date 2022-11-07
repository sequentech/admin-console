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
  .controller('CheckShareCeremonyModal',
    function($scope, $modalInstance, ElectionsApi, Base64Codec, data) {
      $scope.trusteeId = data.trusteeId;
      $scope.username = data.username;
      $scope.password = data.password;
      $scope.numSteps = data.numSteps;
      $scope.currentStep = data.currentStep;
      $scope.election = data.election;
      $scope.ceremony = data.ceremony;
      $scope.verified = false;
      $scope.showSuccess = false;
      $scope.showFailure = false;
      $scope.verifiedFile = null;
      $scope.error = undefined;

      function resetErrorMessages() {
        $scope.showSuccess = false;
        $scope.showFailure = false;
        $scope.error = undefined;
      }

      $scope.handleFile = function () {
        $scope.verified = false;
        $scope.verifiedFile = null;

        resetErrorMessages();
        var fileInput = document.getElementById("fileToUpload");
        var file = fileInput.files[0];

        Base64Codec.fileToBase64(file)
        .then(function (fileBase64) {
          ElectionsApi.checkPrivateKeyShare(
            $scope.election, $scope.trusteeId, $scope.username, $scope.password, fileBase64
          ).then(
            function (result)
            {
              if (200 === result.status && _.isObject(result.data) && !!result.data.payload) {
                $scope.showSuccess = true;
                $scope.verified = true;
                $scope.verifiedFile = file;
              } else {
                $scope.showFailure = true;
              }
              // clear file input after using it
              fileInput.value = null;
            }
          ).catch(
            function (error)
            {
              $scope.error = error.statusText;
            }
          );
        });
      };

      $scope.selectFile = function () {
        var fileInput = document.getElementById("fileToUpload");
        fileInput.click();
      };

      $scope.back = function () {
        $modalInstance.close('back');
      };

      $scope.next = function () {
        $modalInstance.close($scope.verifiedFile);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
