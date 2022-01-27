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
      /**
       * Formats console text into HTML using AnsiUp library
       */
      function consoleTextToHtml(consoleText)
      {
        return $scope.ansiUp.ansi_to_html(
          consoleText
        ).replaceAll('\n', '<br/>');
      }

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
        3000
      );

      /**
       * Implements autoscrolling.
       */
      $scope.runAutoscroll = function ()
      {
        if (!$scope.autoscroll)
        {
          return;
        }
        $timeout(
          function ()
          {
            $('.modal-body.view-task-logs-modal .console .end-marker')[0]
              .scrollIntoView({block: 'start'});
          },
          100
        );
      };

      /**
       * Requests the task from the API and updates it in the modal view.
       */
      $scope.updateTask = function ()
      {
        $scope.error = null;
        Authmethod
        .getTask($scope.task.id)
        .then(
          function success(request)
          {
            Object.assign($scope.task, request.data.tasks[0]);
            if ($scope.task.output && $scope.task.output.stdout)
            {
              $scope.logs = consoleTextToHtml($scope.task.output.stdout);
              $scope.runAutoscroll();
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

      /**
       * Performs initialization.
       */
      $scope.init = function ()
      {
        $scope.taskId = task.id;
        $scope.task = task;
        $scope.error = null;
        $scope.msg = null;
        $scope.autoscroll = true;
        $scope.isOpen = {
          metadata: false,
          console: true
        };
        $scope.taskUpdateTimeout = null;
        $scope.logs = '';
        $scope.ansiUp = new AnsiUpService();
        $scope.ansiUp.use_classes = true;
        $scope.url_whitelist = {
          http: 0,
          https: 1
        };
        if ($scope.task.output && $scope.task.output.stdout)
        {
          $scope.logs = consoleTextToHtml($scope.task.output.stdout);
        } else {
          $scope.logs = "";
        }
        $scope.runAutoscroll();

        // scroll into the bottom of the modal on start
        $timeout(
          function ()
          {
            $('.modal-body.view-task-logs-modal .autoscroll-span')[0]
              .scrollIntoView({behavior: 'smooth', block: 'start'});
          },
          300
        );
      };
      $scope.init();
    }
  );
