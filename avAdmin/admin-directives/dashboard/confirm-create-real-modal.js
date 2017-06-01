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
  .controller('ConfirmCreateRealModal',
    function($scope, $modalInstance, $modal, ConfigService, Plugins, payload, election) {
      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close($scope.payload);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      var exhtml = {html: [], scope: {}, okhtml: []};
      Plugins.hook(
       'confirm-create-real-modal-extra-html',
       { exhtml: exhtml });
      $scope.exhtml = exhtml.html;
      $scope.okhtml = exhtml.okhtml;
      $scope = _.extend($scope, exhtml.scope);

      $scope.election = election;
    });
