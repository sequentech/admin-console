/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2015-2016  Agora Voting SL <agora@agoravoting.com>

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

// Form to register a ballot box tally sheet
angular.module('avAdmin')
  .controller(
    'ViewTallySheetModal',
    function(
      $scope,
      $modalInstance,
      ElectionsApi,
      allowEdit,
      ballotBox,
      tallySheet
    ) {

      $scope.tallySheet = tallySheet;
      $scope.ballotBox = ballotBox;
      $scope.allowEdit = allowEdit;

      $scope.close = function ()
      {
        $modalInstance.close();
      };
      $scope.close = function ()
      {
        $modalInstance.close("edit-tally-sheet");
      };

      $scope.cancel = function ()
      {
        $modalInstance.dismiss('cancel');
      };
    }
  );
