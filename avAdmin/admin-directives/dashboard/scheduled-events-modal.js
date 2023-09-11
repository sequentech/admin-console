/**
 * This file is part of admin-console.
 * Copyright (C) 2023  Sequent Tech Inc <legal@sequentech.io>

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
  .controller('ScheduledEventsModal',
    function($scope, $modalInstance, election)
    {
      $scope.isEnabled = function (name) {
        return $scope.scheduled_events[name].event_at != null;
      };

      $scope.scheduled_events = {
        start_voting: {
          event_at: (
            election.scheduled_events &&
            election.scheduled_events.start_voting &&
            election.scheduled_events.start_voting.event_at
          ) ? election.scheduled_events.start_voting.event_at
          : null
        },
        end_voting: {
          event_at: (
            election.scheduled_events &&
            election.scheduled_events.end_voting &&
            election.scheduled_events.end_voting.event_at
          ) ? election.scheduled_events.end_voting.event_at
          : null
        }
      };

      $scope.enabled = {
        start_voting: $scope.isEnabled('start_voting'),
        end_voting: $scope.isEnabled('end_voting')
      };

      $scope.ok = function () {
        var scheduledEvents = {
          start_voting: (
            (
              $scope.start_voting_enabled &&
              !!$scope.scheduled_events.start_voting.event_at
            ) ? {
              event_at: $scope.scheduled_events.start_voting.event_at.toISOString()
            } : null
          ),
          end_voting: (
            (
              $scope.end_voting_enabled &&
              !!$scope.scheduled_events.end_voting.event_at
            ) ? {
              event_at: $scope.scheduled_events.end_voting.event_at.toISOString()
            } : null
          )
        };
        $modalInstance.close(scheduledEvents);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
