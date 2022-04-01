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
  .directive('avColumnFilterInt', function($location) {
    function link(scope, element, attrs) {
      scope.status = {
        isOpen: false
      };

      function setkey(el, key, val) {
        if (val === '') {
          delete el[key];
        } else {
          el[key] = val;
        }
      }

      // Allows query parameters to automatically set the initial filter
      function getLocationVar(postfix) {
        var val = $location.search()[attrs.filterPrefix + "__" + postfix];
        try {
            val = parseInt(val, 10);
        } catch(err) {
            val = undefined;
        }
        if (!!val) {
            setkey(scope.filterOptionsVar, attrs.filterPrefix + "__" + postfix, val);
        }
        return (!!val) ? val : '';
      }

      scope.filter = {
        sort: getLocationVar('sort'),
        min: getLocationVar('gt'),
        max: getLocationVar('lt')
      };
      scope.filterPrefix = attrs.filterPrefix;
      scope.filterI18n = attrs.filterI18n;

      scope.filter = {
        sort: getLocationVar('sort'),
        min: getLocationVar('gt'),
        max: getLocationVar('lt')
      };
      scope.filterPrefix = attrs.filterPrefix;
      scope.filterI18n = attrs.filterI18n;

      scope.$watch('filter', function (newFilter, oldFilter) {
        if (_.isEqual(newFilter, oldFilter)) {
          return;
        }

        setkey(scope.filterOptionsVar, scope.filterPrefix + "__sort", scope.filter.sort);
        setkey(scope.filterOptionsVar, scope.filterPrefix + "__gt", scope.filter.min);
        setkey(scope.filterOptionsVar, scope.filterPrefix + "__lt", scope.filter.max);
      }, true);
    }

    return {
      restrict: 'AE',
      link: link,
      scope: {
        filterOptionsVar: '='
      },
      templateUrl: 'avAdmin/admin-directives/column-filters/int/column-filter-int.html'
    };
  });
