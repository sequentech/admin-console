/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2022 Sequent Tech Inc <legal@sequentech.io>

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

angular
  .module('avAdmin')
  .directive(
    'avAdminTasks',
    function(Authmethod, ElectionsApi, $modal, ConfigService)
    {
      function link(scope, element, attrs) {
        scope.commands = [
          {
            i18nString: 'launchSelfTestTask',
            iconClass: 'fa fa-check-square-o',
            actionFunc: function() {
              return scope.launchSelfTestTask();
            },
            enableFunc: function() {
              return Authmethod.isAdmin();
            }
          }
        ];
        scope.rowCommands = [];
        scope.data = [];
        scope.loading = false;
        scope.reload = function () {
        };
        scope.loadMore = function () {
        };
        scope.launchSelfTestTask = function () {
          Authmethod
            .launchSelfTestTask()
            .then(
              function onSuccess(_response) 
              {
                scope.msg = "avAdmin.tasks.commands.launchSelfTestTask.successMessage";
                scope.error = "";
                scope.reload();
              },
              function onError(response) {
                scope.msg = "";
                scope.error = response.data;
                scope.reload();
              }
            );
        };
      }
      return {
        restrict: 'AE',
        link: link,
        templateUrl: 'avAdmin/admin-directives/tasks/tasks.html'
      };
    }
  );
