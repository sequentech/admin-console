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
  .controller(
    'ViewTaskLogsModal',
    function(
      $scope,
      $modalInstance,
      $timeout,
      Authmethod,
      AnsiUpService,
      task
    ) {
      $scope.taskId = task.id;
      $scope.task = task;
      $scope.error = null;
      $scope.msg = null;
      $scope.autoscroll = true;
      $scope.collapsed = {
        metadata: false,
        console: false
      };
      $scope.taskUpdateTimeout = null;
      $scope.logs = '';

      /**
       * update task every 5 seconds if it's being created/pending/running.
       */
      $scope.taskUpdateTimeout = $timeout(
        function () {
          if (!_.contains(
            ['created', 'pending', 'running'],
            task.status
          )) {
            if ($scope.taskUpdateTimeout) {
              $timeout.cancel($scope.taskUpdateTimeout);
            }
          } else {
            $scope.updateTask();
          }
        },
        5000
      );

      /**
       * implements autoscrolling
       */
      $scope.$watch(
        'logs',
        function ()
        {
          if (!$scope.autoscroll)
          {
            return;
          }
          angular.element(document)
            .find('.modal-body.view-task-logs-modal .logs .end-marker')[0]
            .scrollIntoView({behavior: 'smooth', block: 'end'});
        }
      );

      /**
       * Requests the task from the API and updates it in the modal view.
       */
      $scope.updateTask = function ()
      {
        $scope.error = null;
        Authmethod
        .getTask(task)
        .then(
          function success(request)
          {
            Object.assign($scope.task, request.data.tasks[0]);
            if ($scope.task.output && $scope.task.output.stdout)
            {
              $scope.logs = AnsiUpService.ansi_to_html(
                $scope.task.output.stdout
              );
            }
            $scope.error = null;
          },
          function error(request)
          {
            $scope.error = request;
          }
        );
      };

      /**
       * Closes this modal dialog.
       */
      $scope.close = function ()
      {
        $modalInstance.close();
      };
    }
  );
