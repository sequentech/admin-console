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
       $q,
       $state,
       Authmethod,
       Plugins,
       ElectionsApi,
       $stateParams,
       $modal,
       PercentVotesService,
       ConfigService,
       SendMsg)
    {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
      var id = $stateParams.id;

      if (!id) {
        $state.go("admin.basic");
      }
      scope.publicURL = ConfigService.publicURL;

      var statuses = [
        'registered',
        'created',
        'started',
        'stopped',
        'tally_ok',
        'results_ok',
        'results_pub'
      ];

      var nextactions = [
        'avAdmin.dashboard.create',
        'avAdmin.dashboard.start',
        'avAdmin.dashboard.stop',
        'avAdmin.dashboard.tally',
        'avAdmin.dashboard.calculate',
        'avAdmin.dashboard.publish'
      ];

      scope.calculateResultsJson = "";

      function calculateResults(el) {
        if ('tally_ok' !== el.status && 'results_ok' !== el.status && 'stopped' !== el.status) {
          return;
        }

        scope.loading = true;
        scope.prevStatus = 'tally_ok';
        scope.waiting = true;
        /* jshint ignore:start */
        setTimeout(waitElectionChange, 1000);
        /* jshint ignore:end */

        var path = 'calculate-results';
        var method = 'POST';
        ElectionsApi
          .command(el, path, method, scope.calculateResultsJson)
          .then(function onSuccess(response) {
            ElectionsApi.results(el);
          })
          .catch(
            function(error) {
              scope.loading = false; scope.error = error; 
            }
          );
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
              Plugins.hook('election-modified', {old: scope.election, el: el, calculateResults: calculateResults});
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

                if (el.status === 'results_ok' || el.status === 'stopped') {
                  ElectionsApi.results(el);
                  if (!!ConfigService.always_publish) {
                    scope.loading = true;
                    scope.prevStatus = scope.election.status;
                    scope.waiting = true;
                    setTimeout(waitElectionChange, 1000);
                  }
                }
              }
            }
          });
      }

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
          confirmTemplateUrl: "avAdmin/admin-directives/dashboard/confirm-tally-modal.html",
          doAction: function (mode)
          {
            // tally command
            var command = commands[4];

            if (mode === 'all') {
              ElectionsApi.command(
                scope.election,
                command.path,
                command.method,
                command.data
              ).catch(
                function(error)
                {
                  scope.loading = false;
                  scope.error = error;
                }
              );
            // tally only active users
            } else {
              $modal.open({
                templateUrl: "avAdmin/admin-directives/dashboard/confirm-tally-active-modal.html",
                controller: 'ConfirmTallyActiveModal',
                size: 'lg',
                resolve: {
                  election: function () { return scope.election; },
                }
              }).result.then(function (voterids) {
                 ElectionsApi.command(
                  scope.election,
                  'tally-voter-ids',
                  'POST',
                  voterids
                ).catch(
                  function(error)
                  {
                    scope.loading = false;
                    scope.error = error;
                  }
                );
              });
            }
          }
        },
        {
          path: 'calculate-results',
          method: 'POST',
          confirmController: "ConfirmCalculateResultsModal",
          payload: scope.calculateResultsJson,
          confirmTemplateUrl: "avAdmin/admin-directives/dashboard/confirm-calculate-results-modal.html",
          doAction: function (data)
          {
            // calculate results command
            var command = commands[5];
            command.payload = data;
            scope.calculateResultsJson = data;
            var ignorecache = true;
            ElectionsApi.getElection(id, ignorecache)
              .then(function(el) {
                 if ('tally_ok' === el.status || 'results_ok' === el.status || 'stopped' === el.status) {
                   calculateResults(el);
                 }
              });
          }
        },
        {
          path: 'publish-results',
          method: 'POST',
          confirmController: "ConfirmPublishResultsModal",
          confirmTemplateUrl: "avAdmin/admin-directives/dashboard/confirm-publish-results-modal.html"
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

          if (!!el.resultsConfig && el.resultsConfig.length > 0) {
            commands[5].payload = scope.calculateResultsJson = el.resultsConfig;
          } else {
            commands[5].payload = scope.calculateResultsJson = angular.toJson(ConfigService.calculateResultsDefault, true);

          }

          scope.intally = el.status === 'doing_tally';
          if (scope.intally) {
            scope.index = statuses.indexOf('stopped') + 1;
            scope.nextaction = false;
          } else {
            scope.index = statuses.indexOf(el.status) + 1;
            scope.nextaction = nextactions[scope.index - 1];
          }

          if (el.status === 'results_ok' || el.status === 'stopped') {
            ElectionsApi.results(el);
          }

          ElectionsApi.autoreloadStats(el);
        });

      function reload() {
        scope.loading = true;
        scope.prevStatus = scope.election.status;
        scope.waiting = true;
        setTimeout(waitElectionChange, 1000);
      }

      function doAction(index, data) {
        if (scope.intally) {
          return;
        }
        scope.loading = true;
        scope.prevStatus = scope.election.status;
        scope.waiting = true;
        setTimeout(waitElectionChange, 1000);

        var c = commands[index];

        if (angular.isDefined(c.doAction)) {
          c.doAction(data);
          return;
        }

        ElectionsApi.command(scope.election, c.path, c.method, c.data)
          .catch(function(error) { scope.loading = false; scope.error = error; });

        if (c.path === 'start') {
          Authmethod
            .changeAuthEvent(scope.election.id, 'started')
            .then(
              function onSuccess(){}, 
              function onError(response) { scope.loading = false; scope.error = response.data; }
            );
        }

        if (c.path === 'stop') {
          Authmethod
            .changeAuthEvent(scope.election.id, 'stopped')
            .then(
              function onSuccess(){}, 
              function onError(response) { scope.loading = false; scope.error = response.data; }
            );
        }
      }

      function doActionConfirm(index) {
        if (scope.intally) {
          return;
        }
        var command = commands[index];

        // This hook allows plugins to interrupt this function. This interruption
        // usually happens because the plugin does some processing and decides to
        // show another previous dialog at this step, for example.
        var pluginData = {
          election: scope.election,
          command: command,
          deferred: false
        };

        if (!Plugins.hook(
          'dashboard-before-do-action',
          pluginData))
        {
          return;
        }

        function doActionConfirmBulk() {
          if (!angular.isDefined(command.confirmController)) {
            doAction(index);
            return;
          }
          var payload = {};
          if(angular.isDefined(command.payload)) {
            payload = command.payload;
          }

          $modal.open({
            templateUrl: command.confirmTemplateUrl,
            controller: command.confirmController,
            size: 'lg',
            resolve: {
              payload: function () { return payload; }
            }
          }).result.then(function (data) {
            doAction(index, data);
          });
        }

        if (!pluginData.deferred) {
          doActionConfirmBulk();
        } else {
          pluginData.deferred.promise
          .then(function (futureData) {
            doActionConfirmBulk();
          })
          .catch(function (failureData) {
          });
        }
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
        if (el.census.extra_fields && el.census.extra_fields.length > 0) {
           for (var i = 0; i < el.census.extra_fields.length; i++) {
             var field = el.census.extra_fields[i];
             if(field.slug) {
               delete field['slug'];
             }
           }
        }
        el.id = null;
        el.raw = null;
        scope.current = el;
        ElectionsApi.setCurrent(el);
        ElectionsApi.newElection = true;
        $state.go("admin.basic");
      }

      function changeSocial() {
        if(ConfigService.share_social.allow_edit) {
          $modal.open({
            templateUrl: "avAdmin/admin-directives/social-networks/change-social-modal.html",
            controller: "ChangeSocialModal",
            windowClass: "change-social-window",
            size: 'lg',
            resolve: {
              election: function () { return scope.election; },
            }
          }).result.then(function(whateverReturned) {
          });
        }
      }

      function archiveElection(mode) {
        $modal.open({
          templateUrl: "avAdmin/admin-directives/dashboard/confirm-modal.html",
          controller: "ConfirmModal",
          size: 'lg',
          resolve: {
            dialogName: function () { return mode; },
            data: function () { return ""; },
          }
        }).result.then(
          function confirmed() {
            var method = {
              'archive': Authmethod.archive,
              'unarchive': Authmethod.unarchive,
            };

            method[mode](scope.election.id)
              .then(
                function onSuccess() {
                  scope.msg = "avAdmin.dashboard.modals." + mode + ".success"; 
                }, 
                function onError(response) { scope.error = response.data; }
              );  
          }
        );
      }

      function editChildrenParent(mode) {
        $modal.open({
          templateUrl: "avAdmin/admin-directives/dashboard/confirm-modal.html",
          controller: "ConfirmModal",
          size: 'lg',
          resolve: {
            dialogName: function () { return mode; },
            data: function() {
              return JSON.stringify({
                parent_id: scope.election.parent_id,
                children_election_info: scope.election.children_election_info
              });
            }
          }
        }).result.then(
          function confirmed(dataString) {
            var method = {
              'archive': Authmethod.archive,
              'unarchive': Authmethod.unarchive,
            };

            var dataJson = {};
            try {
              dataJson = JSON.parse(dataString);
            } catch (e) {
              scope.error = "Error parsing json";
              return;
            }

            Authmethod.editChildrenParent(dataJson, scope.election.id)
              .then(
                function onSuccess() {
                  scope.msg = "avAdmin.dashboard.modals.editChildrenParent.success"; 
                }, 
                function onError(response) { scope.error = response.data; }
              );
          }
        );
      }

      scope.actions = [
        {
          i18nString: 'changeSocial',
          iconClass: 'fa fa-comment-o',
          actionFunc: function() { return scope.changeSocial(); },
          enableFunc: function() { return ConfigService.share_social.allow_edit; }
        },
        {
          i18nString: 'calculateResults',
          iconClass: 'fa fa-calculator',
          actionFunc: function() { 
            return doActionConfirm(5); // calculate results
          },
          enableFunc: function() { 
            return ['stopped', 'tally_ok', 'results_ok'].indexOf(scope.election.status) !== -1;
          }
        },
        {
          i18nString: 'sendAuthCodes',
          iconClass: 'fa fa-paper-plane-o',
          actionFunc: function() { return scope.sendAuthCodes(); },
          enableFunc: function() { return 'started' === scope.election.status; }
        },
        {
          i18nString: 'archiveElection',
          iconClass: 'fa fa-archive',
          actionFunc: function() { return scope.archiveElection("archive"); },
          enableFunc: function() { return true; }
        },
        {
          i18nString: 'unarchiveElection',
          iconClass: 'fa fa-folder-open-o',
          actionFunc: function() { return scope.archiveElection("unarchive"); },
          enableFunc: function() { return true; }
        },
        {
          i18nString: 'editChildrenParent',
          iconClass: 'fa fa-code-fork',
          actionFunc: function() { return scope.editChildrenParent(); },
          enableFunc: function() { return true; }
        },
      ];

      angular.extend(scope, {
        doAction: doAction,
        doActionConfirm: doActionConfirm,
        sendAuthCodes: sendAuthCodes,
        duplicateElection: duplicateElection,
        changeSocial: changeSocial,
        archiveElection: archiveElection,
        editChildrenParent: editChildrenParent
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
