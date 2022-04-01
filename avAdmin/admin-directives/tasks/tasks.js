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

angular
  .module('avAdmin')
  .directive(
    'avAdminTasks',
    function(Authmethod, $modal)
    {
      function link(scope, _element, _attrs) {
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
        scope.rowCommands = [
          {
            i18nString: 'cancelTask',
            iconClass: "fa fa-close",
            enableFunc: function (task) {
              return _.contains(
                ['created', 'pending', 'running'],
                task.status
              );
            },
            actionFunc: function (task) {
              scope.cancelTask(task);
            }
          },
          {
            i18nString: 'viewTaskLogs',
            iconClass: "fa fa-eye",
            enableFunc: function (_task) {
              return true;
            },
            actionFunc: function (task) {
              scope.viewTaskLogs(task);
            }
          },
        ];
        scope.data = [];
        scope.loading = false;
        scope.nomore = false;
        scope.error = null;
        scope.page = 1;

        /**
         * Load more elements in infinite scrolling mode
         */
        scope.loadMore = function() {
          if (scope.loading || scope.nomore) {
            return;
          }
          scope.loading = true;

          Authmethod
            .getTasks({page: scope.page, n: 20})
            .then(
              function(request)
              {
                scope.loading = false;
                scope.page += 1;
                _.each(
                  request.data.tasks,
                  function (task) {
                    scope.data.push(task);
                  }
                );

                if (request.data.end_index === request.data.total_count) {
                  scope.nomore = true;
                }
              }
            )
            .catch(
              function(request) {
                scope.error = request;
                scope.loading = false;
              }
            );
        };

        /**
         * Reload the data
         */
        scope.reload = function() {
          scope.nomore = false;
          scope.page = 1;
          scope.data.splice(0, scope.data.length);
          scope.loadMore();
        };

        /**
         * Launches the self-test after a confirmation modal
         */
        scope.launchSelfTestTask = function () {
          $modal
            .open({
              templateUrl: "avAdmin/admin-directives/dashboard/admin-confirm-modal.html",
              controller: "AdminConfirmModal",
              size: 'lg',
              resolve: {
                dialogName: function () { return "launchSelfTestTask"; },
                data: function () { return ""; },
              }
            })
            .result
            .then(
              function confirmed()
              {
                Authmethod
                  .launchSelfTestTask()
                  .then(
                    function onSuccess(response)
                    {
                      scope.msg = "avAdmin.tasks.commands.launchSelfTestTask.successMessage";
                      scope.error = "";
                      scope.reload();
                      scope.viewTaskLogs(response.data.task);
                    },
                    function onError(response)
                    {
                      scope.msg = "";
                      scope.error = response.data;
                      scope.reload();
                    }
                  );
              }
            );
        };

        /**
         * Cancels a created/pending/running task
         * @param {*} task
         */
        scope.cancelTask = function (task) {
          $modal
            .open({
              templateUrl: "avAdmin/admin-directives/dashboard/admin-confirm-modal.html",
              controller: "AdminConfirmModal",
              size: 'lg',
              resolve: {
                dialogName: function () { return "cancelTask"; },
                data: function () { return ""; },
              }
            })
            .result
            .then(
              function confirmed()
              {
                Authmethod
                  .cancelTask(task.id)
                  .then(
                    function onSuccess(response)
                    {
                      scope.msg = "avAdmin.tasks.commands.cancelTask.successMessage";
                      scope.error = "";
                      scope.reload();
                      scope.viewTaskLogs(response.data.task);
                    },
                    function onError(response)
                    {
                      scope.msg = "";
                      scope.error = response.data;
                      scope.reload();
                    }
                  );
              }
            );
        };

        /**
         * Shows the task logs in a modal window
         */
        scope.viewTaskLogs = function (task)
        {
          $modal
            .open({
              templateUrl: "avAdmin/admin-directives/tasks/view-task-logs-modal.html",
              controller: "ViewTaskLogsModal",
              size: 'lg',
              resolve: {
                task: function () { return task; }
              }
            })
            .result
            .then(
              function confirmed()
              {
                scope.msg = "";
                scope.error = "";
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
