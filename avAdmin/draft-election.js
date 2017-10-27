/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2015-2017  Agora Voting SL <agora@agoravoting.com>

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
    .factory(
      'DraftElection',
      function(
        $q,
        Plugins,
        Authmethod,
        ConfigService,
        ElectionsApi,
        $i18next,
        $http,
        $timeout,
        $modal,
        $state,
        $stateParams,
        $cookies,
        $rootScope)
      {
        var election;
        var draft_election = {};
        var promise;

        function isEditingDraft() {
          var state = $state.current.name;
          var id = $stateParams.id;
          if (id) {
            return false;
          }
          if (!("admin.basic" === state ||
                "admin.questions" === state ||
                "admin.auth" === state ||
                "admin.censusConfig" === state ||
                "admin.census" === state ||
                "admin.adminFields" === state ||
                "admin.create" === state)) {
            return false;
          }
          return true;
        }

        draft_election.updateDraft = function () {
          if (!isEditingDraft()) {
            election = undefined;
            if (!_.isUndefined(promise)) {
              $timeout.cancel(promise);
            }
            return;
          }

          if (ElectionsApi.currentElections.length === 0 && !!ElectionsApi.currentElection) {
            election = angular.copy(ElectionsApi.currentElection);
          } else {
            election = angular.copy(ElectionsApi.currentElections[0]);
          }

          Authmethod.uploadUserDraft(election)
            .success(function (data) {
              console.log("sucess uploading draft: " + JSON.stringify(JSON.parse(angular.toJson(election)), null, 2));
            })
            .error(function (error) {
              console.log("error uploading draft: " + error);
            });
          promise = $timeout(draft_election.updateDraft, 60000);
        };

        draft_election.eraseDraft = function () {
          election = undefined;
          if (!_.isUndefined(promise)) {
            $timeout.cancel(promise);
          }
          Authmethod.uploadUserDraft({})
            .success(function (data) {
              console.log("sucess erasing draft");
            })
            .error(function (error) {
              console.log("error erasing draft: " + error);
            });
        };

        return draft_election;
      });
