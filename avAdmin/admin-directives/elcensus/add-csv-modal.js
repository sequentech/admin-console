/**
 * This file is part of admin-console.
 * Copyright (C) 2015-2016  Sequent Tech Inc <legal@sequentech.io>

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
  .controller(
    'AddCsvModal',
    function($scope, $modalInstance, election, ConfigService, Plugins) 
    {
      $scope.election = election;
      $scope.textarea = "";
      $scope.helpurl = ConfigService.helpUrl;
      $scope.verify_census = false;
      $scope.ok = function () {
        $modalInstance.close(
          $("#csv-textarea").val(),
          $scope.verify_census
        );
      };

      // if there's a parent election, add those fields at the end of the example
      if ($scope.election.children_election_info) 
      {
        $scope.childrenElections = _.map(
          $scope.election.children_election_info.natural_order,
          function (election_id) { 
            return $scope.election.childrenElectionNames[election_id]; 
          }
        );
      } else {
        $scope.childrenElections = [];
      }

      var exhtml = {html: [], scope: {}};
      Plugins.hook(
       'census-add-csv-modal',
       { exhtml: exhtml }
      );
      $scope.exhtml = exhtml.html;
      $scope = _.extend($scope, exhtml.scope);

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }
  );
