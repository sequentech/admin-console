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
  .controller('DownloadShareCeremonyModal',
    function($scope, $modalInstance, $window, ElectionsApi, data) {
      $scope.trusteeId = data.trusteeId;
      $scope.username = data.username;
      $scope.password = data.password;
      $scope.numSteps = data.numSteps;
      $scope.currentStep = data.currentStep;
      $scope.election = data.election;

      $scope.download = function () {
        ElectionsApi.downloadPrivateKeyShare(
          $scope.election, $scope.trusteeId, $scope.username, $scope.password
        ).then(
          function (result)
          {
            var data = _.isObject(result.data)? JSON.stringify(result.data): result.data;
            var blob = new $window.Blob([data], {type: "text/plain"});
            $window.saveAs(blob, "election-" + $scope.election.id + "-trustee-"  + $scope.trusteeId  + "-keys" + ".txt");
          }
        ).catch(
          function(error)
          {
            $scope.error = error.statusText;
          }
        );
      };

      $scope.ok = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
