/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2015-2021  Agora Voting SL <agora@agoravoting.com>

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
  .directive(
    'avAdminHead', 
    function(
      Authmethod,
      $state, 
      $cookies,
      OnboardingTourService,
      ShowVersionsModalService,
      ConfigService,
      AdminProfile, 
      $sce
    ) {
      // we use it as something similar to a controller here
      function link(scope, element, attrs)
      {
        var autheventid = Authmethod.getAuthevent();
        var postfix = "_authevent_" + autheventid;
        var admin = $cookies.get("user" + postfix);
        scope.admin = admin;
        scope.organization = ConfigService.organization;
        scope.allowAdminRegistration = ConfigService.allowAdminRegistration;
        scope.technology = ConfigService.technology;
        scope.nologin = ('nologin' in attrs) || scope.admin;
        scope.helpurl = ConfigService.helpUrl;
        scope.signupLink = ConfigService.signupLink;
        scope.OnboardingTourService = OnboardingTourService;
        scope.helpList = _.map(
          ConfigService.helpList, 
          function (item, index) {
            return $sce.trustAsHtml(item);
          }
        );
        scope.showVersionsModal = ShowVersionsModalService;
        scope.configService = ConfigService;

        scope.showFeatures = function () 
        {
          if (
            "admin.login" === $state.current.name ||
            "admin.login_email" === $state.current.name ||
            "admin.signup" === $state.current.name
          ) {
            return false;
          }
          return true;
        };

        scope.loginrequired = ('loginrequired' in attrs);
        if (scope.loginrequired && !scope.admin) 
        {
          $state.go("admin.logout");
        }

        scope.openProfileEditorModal = AdminProfile.openProfileModal;
        scope.openProfileEditorModal(true);
      }

      return {
        restrict: 'AE',
        scope: {
        },
        link: link,
        templateUrl: 'avAdmin/admin-head-directive/admin-head-directive.html'
      };
    }
  );
