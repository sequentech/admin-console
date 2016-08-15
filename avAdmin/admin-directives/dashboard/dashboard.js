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
    'avAdminDashboard', 
    function(
       $state, 
       Authmethod, 
       Plugins, 
       ElectionsApi, 
       $stateParams, 
       $modal, 
       PercentVotesService, 
       SendMsg)
    {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
      var id = $stateParams.id;

      if (!id) {
        $state.go("admin.basic");
      }

      var statuses = [
        'registered',
        'created',
        'started',
        'stopped',
        'results_ok',
        'results_pub'
      ];

      var nextactions = [
        'avAdmin.dashboard.create',
        'avAdmin.dashboard.start',
        'avAdmin.dashboard.stop',
        'avAdmin.dashboard.tally',
        'avAdmin.dashboard.publish'
      ];


      var commands = [
        {path: 'register', method: 'GET'},
        {
          path: 'create',
          method: 'POST',
          confirmController: "ConfirmCreateModal",
          confirmTemplateUrl: "avAdmin/admin-directives/dashboard/confirm-create-modal.html"
        },
        {
          path: 'start',
          method: 'POST',
          confirmController: "ConfirmStartModal",
          confirmTemplateUrl: "avAdmin/admin-directives/dashboard/confirm-start-modal.html"
        },
        {
          path: 'stop',
          method: 'POST',
          confirmController: "ConfirmStopModal",
          confirmTemplateUrl: "avAdmin/admin-directives/dashboard/confirm-stop-modal.html"
        },
        {
          path: 'tally',
          method: 'POST',
          confirmController: "ConfirmTallyModal",
          confirmTemplateUrl: "avAdmin/admin-directives/dashboard/confirm-tally-modal.html"
        },
        {
          path: 'publish-results',
          method: 'POST',
          confirmController: "ConfirmPublishResultsModal",
          confirmTemplateUrl: "avAdmin/admin-directives/dashboard/confirm-publish-results-modal.html"
        }
      ];

      scope.actions = [
        {
          i18nString: 'changeSocial',
          actionFunc: function() { return scope.changeSocial(); },
          enableFunc: function() { return true; }
        }
      ];

      scope.statuses = statuses;
      scope.election = {};
      scope.index = 0;
      scope.nextaction = 0;
      scope.loading = true;
      scope.waiting = false;
      scope.error = null;
      scope.msg = null;
      scope.prevStatus = null;
      scope.percentVotes = PercentVotesService;

      ElectionsApi.getElection(id)
        .then(function(el) {
          scope.loading = false;
          scope.election = el;
          scope.intally = el.status === 'doing_tally';
          if (scope.intally) {
            scope.index = statuses.indexOf('stopped') + 1;
            scope.nextaction = false;
          } else {
            scope.index = statuses.indexOf(el.status) + 1;
            scope.nextaction = nextactions[scope.index - 1];
          }

          if (el.status === 'results_ok') {
            ElectionsApi.results(el);
          } else if (el.status === 'tally_ok') {
            // auto launch calculate
            calculateResults(el);
          }

          ElectionsApi.autoreloadStats(el);
        });

      function reload() {
        scope.loading = true;
        scope.prevStatus = scope.election.status;
        scope.waiting = true;
        setTimeout(waitElectionChange, 1000);
      }

      function waitElectionChange() {
        var ignorecache = true;
        ElectionsApi.getElection(id, ignorecache)
          .then(function(el) {
            if (el.status === scope.prevStatus && scope.waiting) {
              setTimeout(waitElectionChange, 1000);
            } else {
              scope.waiting = false;
              scope.loading = false;
              scope.prevStatus = null;
              scope.election = el;

              scope.intally = el.status === 'doing_tally';
              if (scope.intally) {
                scope.index = statuses.indexOf('stopped') + 1;
                scope.nextaction = false;
                scope.prevStatus = scope.election.status;
                scope.waiting = true;
                waitElectionChange();
              } else {
                scope.index = statuses.indexOf(el.status) + 1;
                scope.nextaction = nextactions[scope.index - 1];
                // auto launch calculate
                if (el.status === 'tally_ok') {
                  calculateResults(el);
                }

                if (el.status === 'results_ok') {
                  ElectionsApi.results(el);
                }
              }
            }
          });
      }

      function doActionConfirm(index) {
        if (scope.intally) {
          return;
        }
        var command = commands[index];
        if (!angular.isDefined(command.confirmController)) {
          doAction(index);
          return;
        }

        $modal.open({
          templateUrl: command.confirmTemplateUrl,
          controller: command.confirmController,
          size: 'lg'
        }).result.then(function () {
          doAction(index);
        });
      }

      function doAction(index) {
        if (scope.intally) {
          return;
        }
        scope.loading = true;
        scope.prevStatus = scope.election.status;
        scope.waiting = true;
        setTimeout(waitElectionChange, 1000);

        var c = commands[index];
        ElectionsApi.command(scope.election, c.path, c.method, c.data)
          .catch(function(error) { scope.loading = false; scope.error = error; });

        if (c.path === 'start') {
          Authmethod.changeAuthEvent(scope.election.id, 'started')
            .error(function(error) { scope.loading = false; scope.error = error; });
        }

        if (c.path === 'stop') {
          Authmethod.changeAuthEvent(scope.election.id, 'stopped')
            .error(function(error) { scope.loading = false; scope.error = error; });
        }
      }

      function calculateResults(el) {
          if (el.status !== 'tally_ok') {
            return;
          }

          scope.loading = true;
          scope.prevStatus = 'tally_ok';
          scope.waiting = true;
          setTimeout(waitElectionChange, 1000);

          var path = 'calculate-results';
          var method = 'POST';
          // TODO add config to calculate results
          var data = [
            [
              "agora_results.pipes.results.do_tallies",
              {"ignore_invalid_votes": true}
            ],
            [
              "agora_results.pipes.sort.sort_non_iterative",
              {
                "question_indexes": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
              }
            ]
          ];
          ElectionsApi.command(el, path, method, data)
            .catch(function(error) { scope.loading = false; scope.error = error; });
      }

      function sendAuthCodes() {
        SendMsg.setElection(scope.election);
        SendMsg.scope = scope;
        SendMsg.user_ids = null;
        SendMsg.sendAuthCodesModal();

        return false;
      }

      function duplicateElection() {
        var el = ElectionsApi.templateEl();
        _.extend(el, angular.copy(scope.election));
        scope.current = el;
        el.id = null;
        ElectionsApi.setCurrent(el);
        ElectionsApi.newElection = true;
        $state.go("admin.basic");
      }

      function createRealElection() {
        var el = ElectionsApi.templateEl();
        _.extend(el, angular.copy(scope.election));
        scope.current = el;
        el.id = null;
        el.real = true;
        ElectionsApi.setCurrent(el);
        ElectionsApi.newElection = true;
        $state.go("admin.create", {"autocreate": true});
      }

      function changeSocial() {
        $modal.open({
          templateUrl: "avAdmin/admin-directives/dashboard/change-social-modal.html",
          controller: "ChangeSocialModal",
          size: 'lg',
          resolve: {
            election: function () { return scope.election; },
          }
        }).result.then(function(textarea) {
          scope.addToCensus(textarea);
        });
      }

      angular.extend(scope, {
        doAction: doAction,
        doActionConfirm: doActionConfirm,
        sendAuthCodes: sendAuthCodes,
        duplicateElection: duplicateElection,
        createRealElection: createRealElection,
        changeSocial: changeSocial
      });
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-directives/dashboard/dashboard.html'
    };
  });
