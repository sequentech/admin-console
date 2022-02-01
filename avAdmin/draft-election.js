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
        $interval,
        $modal,
        $state,
        $stateParams,
        $cookies,
        $rootScope)
      {
        var election;
        var draft_election = {};
        var promise;
        draft_election.getDraft = function (update_func) {
          var deferred = $q.defer();
          if (_.isFunction(update_func)) {
            if (!_.isUndefined(election) &&
                "{}" !== JSON.stringify(election))
            {
              if (election.id) {
                  delete election.id;
            }
              update_func(election);
            }
          }

          Authmethod.getUserDraft()
            .then(
              function onSuccess(response) {
                election = response.data;
                deferred.resolve(election);
              },
              function onError(response) {
                console.log("error downloading draft: " + response.data);
                deferred.reject(response.data);
              }
            );
          return deferred.promise;
        };

        draft_election.isEditingDraft = function () {
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
        };

        draft_election.updateDraft = function () {
          if (!draft_election.isEditingDraft()) {
            election = undefined;
            if (!_.isUndefined(promise)) {
              $interval.cancel(promise);
            }
            return;
          }

          if (ElectionsApi.currentElections.length === 0 && !!ElectionsApi.currentElection) {
            election = angular.copy(ElectionsApi.currentElection);
          } else {
            election = angular.copy(ElectionsApi.currentElections[0]);
          }

          Authmethod.uploadUserDraft(election)
            .then(
              function onSuccess(data) {
              },
              function onError(response) {
                console.log("error uploading draft: " + response.data);
              }
            );
          promise = $interval(draft_election.updateDraft, 60000);
        };

        draft_election.eraseDraft = function () {
          var deferred = $q.defer();
          election = undefined;
          if (!_.isUndefined(promise)) {
            $interval.cancel(promise);
          }
          Authmethod
            .uploadUserDraft({})
            .then(deferred.resolve, deferred.reject);
          return deferred.promise;
        };

        return draft_election;
      });
