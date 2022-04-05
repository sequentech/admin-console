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
  .directive('avColumnFilterDatetime', function() {
    function link(scope, element, attrs) {
      scope.status = {
        isOpen: false
      };
      scope.filter = {
        sort: '',
        min: '',
        max: ''
      };
      scope.filterPrefix = attrs.filterPrefix;
      scope.filterI18n = attrs.filterI18n;

      function setkey(el, key, val) {
        if (val === '') {
          delete el[key];
        } else {
          el[key] = val;
        }
      }

      scope.$watch('filter', function (newFilter, oldFilter) {
        if (_.isEqual(newFilter, oldFilter)) {
          return;
        }

        var minStr = (!scope.filter.min) ? "" : scope.filter.min.toISOString();
        var maxStr = (!scope.filter.max) ? "" : scope.filter.max.toISOString();

        setkey(scope.filterOptionsVar, scope.filterPrefix + "__sort", scope.filter.sort);
        setkey(scope.filterOptionsVar, scope.filterPrefix + "__gt", minStr);
        setkey(scope.filterOptionsVar, scope.filterPrefix + "__lt", maxStr);
      }, true);
    }

    return {
      restrict: 'AE',
      link: link,
      scope: {
        filterOptionsVar: '='
      },
      templateUrl: 'avAdmin/admin-directives/column-filters/datetime/column-filter-datetime.html'
    };
  });
