/**
 * This file is part of admin-console.
 * Copyright (C) 2017  Sequent Tech Inc <legal@sequentech.io>

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
  .controller('CsvLoadingModal',
    function(
      $scope,
      $modalInstance,
      ConfigService,
      CsvLoad,
      election,
      textarea,
      verifyCensus,
      errorFunc
    ) {
      $scope.election = election;
      $scope.textarea = textarea;
      $scope.verifyCensus = verifyCensus;
      $scope.helpurl = ConfigService.helpUrl;
      $scope.error = errorFunc;
      $scope.disableOk = false;

      $scope.cancel = function (error) {
        $modalInstance.dismiss(_.isUndefined(error)? 'cancel': error);
      };
      
      $scope.close = function () {
        $modalInstance.close('ok');
      };
      
      CsvLoad.processCsv($scope);

      $scope.ok = function () {
        $scope.disableOk = true;
        CsvLoad.uploadCSV();
      };
    });
