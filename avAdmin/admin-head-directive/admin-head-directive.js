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

angular.module('avAdmin')
  .directive('avAdminHead', function(Authmethod, $state, $window, $cookies, $i18next, $modal, OnboardingTourService, ConfigService, AdminProfile, $sce) {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
        var autheventid = Authmethod.getAuthevent();
        var postfix = "_authevent_" + autheventid;
        var admin = $cookies["user" + postfix];
        scope.admin = admin;
        scope.organization = ConfigService.organization;
        scope.technology = ConfigService.technology;
        scope.nologin = ('nologin' in attrs) || scope.admin;
        scope.helpurl = ConfigService.helpUrl;
        scope.signupLink = ConfigService.signupLink;
        scope.OnboardingTourService = OnboardingTourService;
        scope.helpList = _.map(ConfigService.helpList, function (item, index) {
          return $sce.trustAsHtml(item);
        });

        scope.loginrequired = ('loginrequired' in attrs);
        if (scope.loginrequired && !scope.admin) {
            $state.go("admin.logout");
        }

        function maybeStartOnboarding() {
          // launch the onboarding tour if the profile has been correctly
          // filled up and the election list is zero
          if ($window.electionsTotalCount !== undefined && $window.electionsTotalCount === 0)
          {
              OnboardingTourService();
          }
        }

        scope.openProfileEditorModal = AdminProfile.openProfileModal;
        scope.openProfileEditorModal(true)
          .then(maybeStartOnboarding,maybeStartOnboarding);
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-head-directive/admin-head-directive.html'
    };
  });
