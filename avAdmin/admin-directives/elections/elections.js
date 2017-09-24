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
    function(Authmethod, ElectionsApi, $state, Plugins, i18next)
    {
        // we use it as something similar to a controller here
        function link(scope, element, attrs) {
            scope.page = 1;
            scope.loading = false;
            scope.nomore = false;
            scope.elections = [];
            scope.onboardingSteps = [
                {
                    title: "Create an election",
                    position: "right",
                    description: "Start creating an election clicking in this sidebar button",
                    attachTo: "#admin-sidebar-admin.elections"
                }
            ];

            function loadMoreElections() {
                if (scope.loading || scope.nomore) {
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

                Authmethod.electionsIds(scope.page)
                    .success(function(data) {
                        scope.page += 1;

                        if (data.end_index === data.total_count) {
                            scope.nomore = true;
                        }

                        // here we've the elections id, then we need to ask to
                        // ElectionsApi for each election and load it.
                        scope.loading = data.perms.length;
                        getAllElections(data.perms);
                    })
                    .error(function(data) {
                        scope.loading = false;
                        scope.error = data;
                    });
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
            });
        }

        return {
        restrict: 'AE',
        scope: {
        },
        link: link,
        templateUrl: 'avAdmin/admin-directives/elections/elections.html'
        };
    }
  );
