/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2017  Agora Voting SL <agora@agoravoting.com>

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
    'avNumberInput',
    [
    function () {
      function link (scope, element, attrs) {
        scope.$watch(attrs.ngModel, function (newValue, oldValue) {
          if (_.isString(newValue) && !isNaN(parseInt(newValue))) {
            scope.$evalAsync(function () {
              eval('scope.' + attrs.ngModel + ' = ' + parseInt(newValue) + ';'); // jshint ignore:line
            });
          }
        });
      }

      return {
        restrict: 'AEC',
        scope: false,
        link: link
      };
    }]);
