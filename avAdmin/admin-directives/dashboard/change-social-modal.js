/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2016  Agora Voting SL <agora@agoravoting.com>

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
  .controller('ChangeSocialModal',
    function($scope, $modalInstance, ConfigService) {
      $scope.socialNetList = [
        {
          name: 'Facebook',
          logo_url: '/admin/img/facebook_logo_50.png'
        },
        {
          name: 'Twitter',
          logo_url: '/admin/img/twitter_logo_48.png'
        }
      ];

      $scope.socialConfig = [
        {
          name: 'my button name',
          type: 'Facebook',
          url_text: '',
          main_text: '',
          active: true
        }
      ];

      $scope.ok = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
