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
  .controller('KeyDistributionCeremonyModal',
    function($scope, $modalInstance, ConfigService, dialogName, data) {
      $scope.helpurl = ConfigService.helpUrl;
      $scope.dialogName = dialogName;

      $scope.textarea = {
        data: data
      };

      $scope.ok = function () {
        $modalInstance.close($scope.textarea.data);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
