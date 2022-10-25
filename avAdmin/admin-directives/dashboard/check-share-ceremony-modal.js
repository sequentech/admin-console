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
    function($scope, $modalInstance, $q, $timeout, ElectionsApi, data) {
      $scope.trusteeId = data.trusteeId;
      $scope.username = data.username;
      $scope.password = data.password;
      $scope.numSteps = data.numSteps;
      $scope.currentStep = data.currentStep;
      $scope.election = data.election;
      $scope.verified = false;
      $scope.showSuccess = false;
      $scope.showFailure = false;
      $scope.timeoutPromise = null;

      function getBase64(file) {
        var deferred = $q.defer();
        var reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = function () {
          deferred.resolve(reader.result);
        };
        reader.onerror = function (error) {
          deferred.reject(error);
        };

        return deferred.promise;
      }

      function resetErrorMessages() {
        $scope.showSuccess = false;
        $scope.showFailure = false;
      }

      $scope.handleFile = function () {
        if ($scope.timeoutPromise) {
          $timeout.cancel($scope.timeoutPromise);
        }
        $scope.verified = false;
        resetErrorMessages();
        var fileInput = document.getElementById("fileToUpload");
        var file = fileInput.files[0];

        getBase64(file)
        .then(function (fileBase64) {
          ElectionsApi.checkPrivateKeyShare(
            $scope.election, $scope.trusteeId, $scope.username, $scope.password, fileBase64
          ).then(
            function (result)
            {
              // clear file input after using it
              fileInput.value = null;
              $scope.showSuccess = true;
              $scope.verified = true;
              $scope.timeoutPromise = $timeout(resetErrorMessages, 1500);
            }
          ).catch(
            function (error)
            {
              $scope.error = error.statusText;
              $scope.showFailure = true;
              $scope.timeoutPromise = $timeout(resetErrorMessages, 1500);
            }
          );
        });
      };

      $scope.selectFile = function () {
        var fileInput = document.getElementById("fileToUpload");
        fileInput.click();
      };

      $scope.ok = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
