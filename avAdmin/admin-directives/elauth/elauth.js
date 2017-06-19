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
  .directive('avAdminElauth', ['ElectionsApi', 'NextButtonService', function(ElectionsApi, NextButtonService) {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
        scope.election = ElectionsApi.currentElection;
        scope.auth = ['email', 'sms'];
        //scope.auth = ['email', 'sms', 'dnie'];
        scope.electionEditable = function() {
          return !scope.election.id || scope.election.status === "registered";
        };
        scope.goNext = NextButtonService.goNext;

        var pluginData = {
          'scope': scope
        };
        Plugins.hook('new-election-elauth', pluginData);
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-directives/elauth/elauth.html'
    };
  }]);
