/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2018  Agora Voting SL <agora@agoravoting.com>

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
    'avAdminActivityLog',
    function(
      Authmethod,
      ConfigService,
      NextButtonService,
      $timeout)
    {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
      scope.electionId = attrs.electionId;
      scope.reloadingActivity = false;
      scope.loading = false;
      scope.activity = [];
      scope.nomore = false;
      scope.error = null;
      scope.page = 1;
      scope.msg = null;
      scope.resizeSensor = null;
      scope.helpurl = ConfigService.helpUrl;
      scope.filterStr = "";
      scope.filterTimeout = null;
      scope.filterOptions = {};
      scope.stringify = JSON.stringify;

      scope.goNext = NextButtonService.goNext;

      /**
       * Load more activity in infinite scrolling mode
       */
      function loadMoreActivity(reload) {
        if (scope.loading || scope.nomore) {
          if (scope.reloadingActivity) {
            scope.reloadingActivity = false;
          }
          return;
        }
        scope.loading = true;

        Authmethod.getActivity(
            scope.electionId,
            scope.page,
            null,
            scope.filterOptions,
            scope.filterStr)
        .success(
            function(data)
            {
                scope.page += 1;
                if (scope.reloadingActivity)
                {
                    scope.reloadingActivity = false;
                }
                _.each(data.activity, function (obj) {
		    // I'm doing this because if we try to get this from the
		    // template, doesn't work: {{obj.metadata.comment}} is
		    // always undefined
                    obj.metadatacomment = obj.metadata.comment;
                    scope.activity.push(obj);
                });

                if (data.end_index === data.total_count) {
                    scope.nomore = true;
                }
                scope.loading = false;
            }
        )
        .error(
            function(data) {
                scope.error = data;
                scope.loading = false;

                if (scope.reloadingActivity) {
                    scope.reloadingActivity = false;
                }
            }
        );
      }

      function reloadActivity() {
        scope.nomore = false;
        scope.page = 1;
        scope.reloadingActivity = true;
        scope.activity.splice(0, scope.activity.length);

        loadMoreActivity();
      }

      // debounced reloading
      function reloadActivityDebounce() {
        $timeout.cancel(scope.filterTimeout);
        scope.filterTimeout = $timeout(function() {
          scope.reloadActivity();
        }, 500);
      }

      // debounced filter options
      scope.$watch("filterOptions", function(newOpts, oldOpts) {
        if (_.isEqual(newOpts, oldOpts)) {
          return;
        }
        reloadActivityDebounce();
      }, true);

      // debounced filter
      scope.$watch("filterStr", function(newStr, oldStr) {
        if (newStr === oldStr) {
          return;
        }
        reloadActivityDebounce();
      });

      // overflow-x needs to resize the height
      var dataElement = angular.element(".data-table");
      /* jshint ignore:start */
      scope.resizeSensor = new ResizeSensor(dataElement, function() {
        if (dataElement.width() > $(element).width()) {
          $(element).width(dataElement.width());
          $(element).parent().css('overflow-x', 'auto');
        }
      });
      /* jshint ignore:end */
      scope.$on("$destroy", function() { delete scope.resizeSensor; });

      angular.extend(scope, {
        loadMoreActivity: loadMoreActivity,
        reloadActivity: reloadActivity
      });

      scope.reloadActivity();
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-directives/activity-log/activity-log.html'
    };
  });
