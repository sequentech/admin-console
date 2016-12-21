/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2016  Agora Voting SL <nvotes@nvotes.com>

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
  .controller('ConfirmCalculateResultsModal',
    function($scope, $modalInstance, ConfigService, payload) {
      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close($scope.payload);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
 
      $scope.payload = payload;

      $scope.editJson = function()
      {
        if(!ConfigService.allowEditCalculateResultsJson) {
          return;
        }
        // show the initial edit dialog
        $modal
          .open({
            templateUrl: "avAdmin/admin-directives/dashboard/edit-calculate-results-json-modal.html",
            controller: "EditCalculateResultsJsonModal",
            size: 'lg',
            resolve: {
              payload: function () { return angular.toJson($scope.payload, true); }
            }
          })
          .result.then(
            function (data)
            {
              scope.payload = angular.fromJson(data.calculateResultsJson);
            }
          );
      };
    });
