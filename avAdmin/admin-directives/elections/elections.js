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
  .directive(
    'avAdminElections',
    function(Authmethod, ElectionsApi, DraftElection, AdminProfile, OnboardingTourService, $state, Plugins, $modal, $timeout, $window)
    {
        // we use it as something similar to a controller here
        function link(scope, element, attrs) {
            scope.page = 1;
            scope.loading = false;
            scope.nomore = false;
            scope.list = {type: 'all'};
            scope.elections = [];

            /**
             * Downloads elections from Elections api, initialize them and
             * insert them in the list in the appropiate place.
             */
            function getAllElections(list, parentElection) 
            {
                list.forEach(function (event) 
                    {
                        ElectionsApi.getElection(event.id, false, event)
                            .then(function(d) 
                            {
                                d.showingChildren = false;
                                d.childrenDownloaded = false;
                                if (parentElection === undefined) {
                                    d.childrenElections = [];
                                    scope.elections.push(d);
                                } else {
                                    parentElection.childrenElections.push(d);
                                }
                                scope.loading -= 1;
                                if (scope.loading === 0 && !!parentElection) {
                                    parentElection.childrenDownloaded = true;
                                }
                            })
                            .catch(function(d) 
                            {
                                // election doesn't exists in ballot-box
                                console.log("Not in sequent elections: " + event.id);
                                scope.loading -= 1;
                            });
                    }
                );
            }

            /**
             * Hides or shows the children of an election
             */
            function setChildrenVisibility(parentElectionId, visible) {
                _.each(
                    scope.elections,
                    function (election) {
                        if (election.parent_id === parentElectionId) {
                            election.visible = visible;
                        }
                    }
                );
            }

            /**
             * Toggles the visibility of an election's children. It also
             * first downloads these election if needed. 
             * 
             * Called from the template.
             */
            function toggleShowChildren(election)
            {
                if (scope.loading) {
                    return;
                }
                election.showingChildren = !election.showingChildren;

                // if this is the first time and children need to be downloaded
                if (!election.childrenDownloaded && election.showingChildren)
                {
                    var childrenIds = election.children_election_info.natural_order;

                    // download children and add them after the index in the list
                    Authmethod
                        .electionsIds(1, scope.list.type, childrenIds, childrenIds.length)
                        .then(
                            function(response) 
                            {
                                // here we've the elections id, then we need to ask to
                                // ElectionsApi for each election and load it.
                                scope.loading = response.data.events.length;
                                getAllElections(response.data.events, election);
                            },
                            function onError(response) 
                            {
                                scope.loading = false;
                                scope.error = response.data;
                            }
                        );
                } else {
                    setChildrenVisibility(election.id, election.showingChildren);
                }
            }

            function maybeStartOnboarding() {
              // launch the onboarding tour if the profile has been correctly
              // filled up and the election list is zero
              if ($window.electionsTotalCount !== undefined &&
                  $window.electionsTotalCount === 0)
              {
                  OnboardingTourService();
              }
            }

            function loadMoreElections(force) 
            {
                if (scope.loading || scope.nomore) 
                {
                    return;
                }
                scope.loading = true;

                Authmethod
                    .electionsIds(scope.page, scope.list.type)
                    .then(
                        function(response) 
                        {
                            scope.page += 1;

                            $window.electionsTotalCount = response.data.total_count;
                            if (!force) 
                            {
                                AdminProfile
                                    .openProfileModal(true)
                                    .then(maybeStartOnboarding, maybeStartOnboarding);
                            }

                            if (response.data.end_index === response.data.total_count) 
                            {
                                scope.nomore = true;
                            }

                            // here we've the elections id, then we need to ask to
                            // ElectionsApi for each election and load it.
                            scope.loading = response.data.events.length;
                            getAllElections(response.data.events);
                        },
                        function onError(response) 
                        {
                            scope.loading = false;
                            scope.error = response.data;
                        }
                    );
            }

            function setListType(listType) {
                scope.list.type = listType;
                scope.page = 1;
                scope.nomore = false;
                scope.elections.splice(0, scope.elections.length);
                scope.loadMoreElections(true);
            }

            function reloadList() {
                scope.page = 1;
                scope.nomore = false;
                scope.elections.splice(0, scope.elections.length);
                scope.loadMoreElections(true);
            }

            scope.exhtml = [];
            Plugins.hook(
            'admin-elections-list-extra-html',
            {
                'exhtml': scope.exhtml
            }
            );

            angular.extend(scope, {
              loadMoreElections: loadMoreElections,
              setListType: setListType,
              toggleShowChildren: toggleShowChildren,
              reloadList: reloadList
            });
        }

        return {
            restrict: 'AE',
            scope: true,
            link: link,
            templateUrl: 'avAdmin/admin-directives/elections/elections.html'
        };
    }
  );
