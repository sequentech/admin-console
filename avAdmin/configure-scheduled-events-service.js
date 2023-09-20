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

/**
 * Service to manage the configuration of scheduled events in an election.
 */
angular
.module('avAdmin')
.factory('ConfigureScheduledEvents', function($modal, Authmethod)
{
  var service = {
    election: null,
  };

  service.launchModal = function (election, onSuccess, onError) {
    service.election = election;
    $modal
    .open({
      templateUrl: "avAdmin/admin-directives/dashboard/scheduled-events-modal.html",
      controller: "ScheduledEventsModal",
      size: 'lg',
      resolve: {
        election: function() 
        {
          return service.election;
        }
      }
    })
    .result
    .then(
      function updateScheduledEvents(scheduledEvents) 
      {
        Authmethod
          .scheduledEvents(service.election.id, scheduledEvents)
          .then(onSuccess, onError); 
      }
    );
  };

  return service;
});
