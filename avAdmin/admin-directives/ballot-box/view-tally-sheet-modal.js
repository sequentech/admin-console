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

// Form to register a ballot box tally sheet
angular.module('avAdmin')
  .controller(
    'ViewTallySheetModal',
    function(
      $scope,
      $modalInstance,
      allowEdit,
      ballotBox,
      tallySheet
    ) {

      $scope.tallySheet = tallySheet.data;
      $scope.tallySheetId = tallySheet.id;
      $scope.ballotBox = ballotBox;
      $scope.allowEdit = allowEdit;

      $scope.edit = function ()
      {
        $modalInstance.close("edit-tally-sheet");
      };

      $scope.cancel = function ()
      {
        $modalInstance.dismiss('cancel');
      };
    }
  );
