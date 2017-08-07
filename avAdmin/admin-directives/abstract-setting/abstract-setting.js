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
    'avAbstractSetting', 
    function(
       $q,
       $state, 
       Authmethod, 
       Plugins, 
       ElectionsApi, 
       $stateParams, 
       $modal, 
       ConfigService,
       SendMsg)
    {
      function link(scope, element, attrs, nullController, transclude) {
        scope.title = '';
        scope.description = '';
        scope.showHelp = false;

        if (_.isString(attrs.title)) {
          scope.title = attrs.title;
        }
        if (_.isString(attrs.description)) {
          scope.description = attrs.description;
        }

        scope.toggleHelp = function() {
          scope.showHelp = !scope.showHelp;
        };

        var widget = angular.element('.abstract-widget');
        if (_.isObject(widget)) {
          transclude(scope, function(clone) {
            widget.append(clone);
          });
        }
      }

      return {
        restrict: 'AEC',
        transclude: true,
        scope: {
        },
        link: link,
        templateUrl: 'avAdmin/admin-directives/abstract-setting/abstract-setting.html'
      };
    });