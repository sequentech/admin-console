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
  .directive(
    'avAdminElbasic', 
    ['$state',
    'ElectionsApi',
    'ConfigService',
    '$modal', 
    'NextButtonService',
    function($state, ElectionsApi, ConfigService, $modal, NextButtonService) {
      // we use it as something similar to a controller here
      function link(scope, element, attrs) {
          scope.election = ElectionsApi.currentElection;
          scope.layouts = ['simple', /*'2questions-conditional', 'pcandidates-election'*/];
          scope.themes = ['default'/*, 'podemos'*/];

          scope.allow_social_edit = ConfigService.share_social.allow_edit;

          scope.electionEditable = function() {
            return !scope.election.id || scope.election.status === "registered";
          };
          

          function openSocialModal() {
            if(ConfigService.share_social.allow_edit) {
              $modal.open({
                templateUrl: "avAdmin/admin-directives/social-networks/change-social-modal.html",
                controller: "ChangeSocialModal",
                windowClass: "change-social-window",
                size: 'lg'
              });
            }
          }

          function incLogins(inc, event) {
            var el = ElectionsApi.currentElection;

            if((!!el.num_successful_logins_allowed || 0 === el.num_successful_logins_allowed) && parseInt(el.num_successful_logins_allowed) + inc >= 0) {
              el.num_successful_logins_allowed = parseInt(el.num_successful_logins_allowed) + inc;
            }
            if (!!event) {
              event.preventDefault();
            }
          }

          function validateNumLogins(value) {
            return !isNaN(parseInt(value));
          }

          scope.goNext = NextButtonService.goNext;

          angular.extend(scope, {
            openSocialModal: openSocialModal,
            incLogins: incLogins,
            validateNumLogins: validateNumLogins
          });
      }

      return {
        restrict: 'AE',
        scope: {
        },
        link: link,
        templateUrl: 'avAdmin/admin-directives/elbasic/elbasic.html'
      };
  }]);
