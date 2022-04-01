/**
 * This file is part of admin-console.
 * Copyright (C) 2016  Sequent Tech Inc <legal@sequentech.io>

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
  .controller('ConfirmCalculateResultsModal',
    function($scope, $modalInstance, $modal, ConfigService, payload) {
      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close($scope.payload);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.payload = payload;
      $scope.editJson = !!ConfigService.allowEditElectionJson;

      $scope.editJson = function()
      {
        if(!ConfigService.allowEditElectionJson) {
          return;
        }
        // show the initial edit dialog
        $modal
          .open({
            templateUrl: "avAdmin/admin-directives/dashboard/edit-calculate-results-json-modal.html",
            controller: "EditCalculateResultsJsonModal",
            size: 'lg',
            resolve: {
              payload: function () { return $scope.payload; }
            }
          })
          .result.then(
            function (data)
            {
              $scope.payload = data;
            }
          );
      };
    });
