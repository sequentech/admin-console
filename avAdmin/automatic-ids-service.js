/**
 * This file is part of admin-console.
 * Copyright (C) 2022-2023  Sequent Tech Inc <legal@sequentech.io>

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
 * Service to manage the keys ceremony modal steps.
 */
angular
.module('avAdmin')
.factory('AutomaticIds', function(
    $q,
    Authmethod
)
{
   var service = {
   };

   /**
    * If the elections are using negative numbers, find the existing election
    * with the highest election id and replace the negative numbers with
    * higher election ids.
    */
   service.fillInElectionIds = function (elections) {
     var deferred = $q.defer();
     var promise = deferred.promise;

     // check if there are negative election ids
     var hasNegativeIds = undefined !== elections.find(function (el) {
       return _.isNumber(el.id) && el.id <= 0;
     });

     /* jshint ignore:start */

     if (elections.length > 1 || hasNegativeIds) {

       // Find highest election id
       Authmethod.highestEvent()
           .then(
             function onSuccess(response) {
               var highestId = response.data.highest_id;
               var newIdsMap = {};

               // map negative ids to new election ids
               for (var idx = 0; idx < elections.length; idx++) {
                 var electionId = elections[idx].id;
                 if (_.isNumber(electionId) && electionId > 0) {
                   newIdsMap[electionId] = electionId;
                 } else {
                   newIdsMap[electionId] = highestId + idx + 1;
                 }
               }

               // replace election ids with new ids
               for (var index = 0; index < elections.length; index++) {
                 var election = elections[index];
                 // replace the election id
                 election.id = newIdsMap[election.id];

                 // replace the parent id
                 if (election.parent_id) {
                   election.parent_id = newIdsMap[election.parent_id] || election.parent_id;
                 }

                 // replace ids for virtualSubelections
                 if (election.virtualSubelections) {
                   election.virtualSubelections = election.virtualSubelections.map(function (e) {
                     return newIdsMap[e] || e;
                   });
                 }

                 // replace ids in the children elections structure
                 if (election.children_election_info &&
                     election.children_election_info.natural_order) {
                   election.children_election_info.natural_order = election.children_election_info.natural_order.map(function (e) {
                     return newIdsMap[e] || e;
                   });
                 }
                 if (election.children_election_info &&
                   election.children_election_info.presentation &&
                   election.children_election_info.presentation.categories) {
                     election.children_election_info.presentation.categories = 
                     election.children_election_info.presentation.categories.map(function (category) {
                       if (category.events) {
                         category.events = category.events.map(function (event) {
                           if (event.event_id) {
                             event.event_id = newIdsMap[event.event_id] || event.event_id;
                           }
                           return event;
                         });
                       }
                       return category;
                     });
                 }

                  // replace census voters for parent-children elections
                  if (election.census && election.census.voters && election.census.voters.length > 0) {
                    election.census.voters = election.census.voters.map(function (voter) {
                      if (voter && voter.metadata && voter.metadata.children_event_id_list &&
                        voter.metadata.children_event_id_list.length > 0) {
                          voter.metadata.children_event_id_list =
                            voter.metadata.children_event_id_list.map(function (event_id) {
                              return newIdsMap[event_id] || event_id;
                            });
                      }
                      return voter;
                    });
                  }

               }
               deferred.resolve(elections);
             },
             deferred.reject
           );
     } else {
       deferred.resolve(elections);
     }
     /* jshint ignore:end */
     return promise;
   };

   return service;
});