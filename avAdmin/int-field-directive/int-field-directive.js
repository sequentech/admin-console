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
  .directive('avIntField', function(ElectionsApi) {
    function link(scope, element, attrs) {
      scope.election = ElectionsApi.currentElection;

      function getVar(path, soFar) {
        var ret; // = undefined
        if (_.isString(path) && 0 < path.length) {
          var pointIndex = path.indexOf(".");
          if (-1 !== pointIndex && 0 < pointIndex) {
            var var_name = path.substr(0, pointIndex);
            var subPath = path.substr(pointIndex + 1);
            var soFar2 = soFar[var_name];
            if (subPath.length > 0 && !!soFar2) {
              ret = getVar(subPath, soFar2);
            }
          }
          else if (_.isObject(soFar)) {
            ret = {
              isDefined: !!(soFar[path]),
              ref: soFar,
              path: path
            };
          }
        }
        return ret;
      } // getVar

      if (_.isString(attrs.ngModel)) {
        var model = getVar(attrs.ngModel, scope);

        if (_.isObject(model) && !!model.isDefined) {
          console.log('felix test: ' + model.ref[model.path]);

          scope.$watch(
            attrs.ng_model,
            function (newVal, oldVal) {
              var parsed = parseInt(newVal);
              if (_.isNaN(parsed)) {
                parsed = newVal;
              }
              if (parsed !== newVal) {
                model.ref[model.path] = parsed;
              }
           });
        }
      }

    } // link

    return {
      scope: false,
      restrict: 'AEC',
      link: link,
      template: ''
    };
  });