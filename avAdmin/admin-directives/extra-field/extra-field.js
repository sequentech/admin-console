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
  .directive('avExtraField', function() {
    function link(scope, element, attrs) {
      scope.toggleEdit = function() {
        if (scope.extra_fields.editing === scope.field) {
          scope.extra_fields.editing = null;
        } else {
          scope.extra_fields.editing = scope.field;
        }
      };

      scope.beingEdited = function() {
        return scope.extra_fields.editing === scope.field;
      };

      scope.incOpt = function (option, inc) {
        if(!scope.field[option]) {
          scope.field[option] = 0;
          return;
        }
        scope.field[option] = parseInt(scope.field[option]) + inc;
      };

      scope.removeField = function() {
        var el = scope.election;
        var ef = el.census.extra_fields;
        var index = ef.indexOf(scope.field);
        el.census.extra_fields = ef.slice(0, index).concat(ef.slice(index+1,ef.length));
      };

      // scroll and show on creation
      if (scope.extra_fields.editing === scope.field) {
        $("html,body").animate({scrollTop: $(element).offset().top - 250}, 400);
      }

      scope.$watch('field.type', function(now, Before) {
        if (scope.field.type === 'dict') {
          scope.field.private = true;
        }
      });
    }

    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avAdmin/admin-directives/extra-field/extra-field.html'
    };
  });
