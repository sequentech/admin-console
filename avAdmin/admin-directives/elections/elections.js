/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2015-2016  Agora Voting SL <agora@agoravoting.com>

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

            function maybeStartOnboarding() {
              // launch the onboarding tour if the profile has been correctly
              // filled up and the election list is zero
              if ($window.electionsTotalCount !== undefined &&
                  $window.electionsTotalCount === 0)
              {
                  OnboardingTourService();
              }
            }

            function loadMoreElections(force) {
                if (scope.loading || !force && scope.nomore) {
                    return;
                }
                scope.loading = true;

                function getAllElections(list) {
                    list.forEach(function (perm) {
                        ElectionsApi.getElection(perm.object_id)
                            .then(function(d) {
                                scope.elections.push(d);
                                scope.loading -= 1;
                            })
                            .catch(function(d) {
                                // election doesn't exists in agora-elections
                                console.log("Not in agora elections: " + perm.object_id);
                                scope.loading -= 1;
                            });
                    });
                }

                Authmethod
                    .electionsIds(scope.page, scope.list.type)
                    .then(
                        function(response) {
                            scope.page += 1;

                            $window.electionsTotalCount = response.data.total_count;
                            AdminProfile
                                .openProfileModal(true)
                                .then(maybeStartOnboarding, maybeStartOnboarding);

                            if (response.data.end_index === response.data.total_count) {
                                scope.nomore = true;
                            }

                            // here we've the elections id, then we need to ask to
                            // ElectionsApi for each election and load it.
                            scope.loading = response.data.perms.length;
                            getAllElections(response.data.perms);
                        },
                        function onError(response) {
                            scope.loading = false;
                            scope.error = response.data;
                        }
                    );
            }

            function setListType(listType) {
                scope.list.type = listType;
                scope.page = 1;
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
              setListType: setListType
            });
        }

        return {
        restrict: 'AE',
        link: link,
        templateUrl: 'avAdmin/admin-directives/elections/elections.html'
        };
    }
  );
