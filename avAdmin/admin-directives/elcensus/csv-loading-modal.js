/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2017  Agora Voting SL <agora@agoravoting.com>

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
  .controller('CsvLoadingModal',
    function($scope, $modalInstance, election, textarea, ConfigService, Plugins) {
      $scope.election = election;
      $scope.textarea = textarea;
      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close('ok');
      };
      // 0 to 100% (when finished)
      $scope.percent = 0;

      var pluginData = {
        html: [],
        scope: {},
        processBatchPlugin: false
      };
      Plugins.hook('census-csv-loading-modal', pluginData);
      $scope.exhtml = pluginData.html;
      $scope = _.extend($scope, pluginData.scope);

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      function processBatch() {
      }

      function processBatchCaller() {
        var processed = processBatch();
        if (_.isFunction(pluginData.processBatchPlugin)) {
          var ret = pluginData.processBatchPlugin(processed);
          $scope.percent = ret.percent;
          
        } else if (_.isNumber(processed.percent)) {
          $scope.percent = processed.percent;
          if ($scope.percent < 100) {
            setTimeout(processBatchCaller, 0);
          }
        }
      }
      setTimeout(processBatchCaller, 0);
    });
