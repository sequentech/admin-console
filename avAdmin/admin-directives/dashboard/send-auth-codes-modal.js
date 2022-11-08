/**
 * This file is part of admin-console.
 * Copyright (C) 2015-2021  Sequent Tech Inc <legal@sequentech.io>

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
  .controller(
    'SendAuthCodesModal',
    function(
      $scope,
      $modalInstance,
      SendMsg,
      ConfigService,
      election,
      user_ids
    ) {
      $scope.election = election;
      $scope.auth = ['email', 'sms'];
      $scope.selectable_auth_method = SendMsg.selectable_auth_method;
      $scope.selected_auth_method = { ref: SendMsg.selected_auth_method };
      $scope.user_ids = user_ids;
      $scope.steps = SendMsg.steps;
      $scope.censusConfig = SendMsg.censusConfig;
      $scope.helpurl = ConfigService.helpUrl;
      $scope.allowHtmlEmails = ConfigService.allowHtmlEmails;
      $scope.showFilter = !user_ids;
      $scope.filterOptions = [
        {
          label: 'none',
          value: '',
        },
        {
          label: 'voted',
          value: 'voted',
        },
        {
          label: 'not_voted',
          value: 'not_voted',
        },
      ];
      $scope.filter = { ref: '' };
      $scope.forceCreateOtp = { ref: '' };
      var slug_text = "";
      for (var i = 0; i < SendMsg.slug_list.length; i++) {
        slug_text += (0 !== i? ", " : "" ) + "__" + SendMsg.slug_list[i] + "__";
      }
      $scope.slug_text = slug_text;

      $scope.showForceCreateOtp = function () {
        return (
          $scope.election.census &&
          _.isObject($scope.election.census) &&
          $scope.election.census.support_otl_enabled
        );
      };

      $scope.ok = function () {
        SendMsg.selected_auth_method = $scope.selected_auth_method.ref;
        SendMsg.filter = $scope.showFilter? ($scope.filter.ref || null) : undefined;
        $modalInstance.close($scope.user_ids);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
