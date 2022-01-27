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
  .directive(
    'avAdminSidebar', 
    function($cookies, Authmethod, DraftElection, ElectionsApi, $window) 
    {
      // we use it as something similar to a controller here
      function link(scope, element, attrs) {
          var autheventid = Authmethod.getAuthevent();
          var postfix = "_authevent_" + autheventid;
          var admin = $cookies.get("user" + postfix);
          scope.admin = admin;
          scope.isAdmin = $cookies.put("isAdmin" + postfix);
          scope.active = attrs.active;
          scope.showImport = !!$window.showOpenFilePicker;
          scope.isEditingDraft = DraftElection.isEditingDraft;
          scope.globalPerms = { val: '' };

          // update perms
          ElectionsApi
            .getEditPerm(null)
            .then(
              function (perm) {
                scope.globalPerms.val = perm;
              }
            );
      }

      return {
        restrict: 'AE',
        link: link,
        templateUrl: 'avAdmin/admin-sidebar-directive/admin-sidebar-directive.html'
      };
    }
  );
