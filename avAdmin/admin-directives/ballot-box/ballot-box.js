/**
 * This file is part of admin-console.
 * Copyright (C) 2018  Sequent Tech Inc <legal@sequentech.io>

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
    'avAdminBallotBox',
    function(
      Authmethod,
      ConfigService,
      NextButtonService,
      $timeout,
      $i18next,
      $modal,
      $location,
      ElectionsApi
    )
    {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
      scope.electionId = attrs.electionId;
      scope.reloading = false;
      scope.loading = false;
      scope.object_list = [];
      scope.nomore = false;
      scope.error = null;
      scope.page = 1;
      scope.msg = null;
      scope.resizeSensor = null;
      scope.helpurl = ConfigService.helpUrl;
      scope.filterStr = "";
      scope.filterTimeout = null;
      scope.filterOptions = {};

      scope.goNext = NextButtonService.goNext;

      /**
       * Load more objects in infinite scrolling mode
       */
      function loadMore(reload) {
        if (scope.loading || scope.nomore) {
          if (scope.reloading) {
            scope.reloading = false;
          }
          return;
        }
        scope.loading = true;

        Authmethod.getBallotBoxes(
            scope.electionId,
            scope.page,
            null,
            scope.filterOptions,
            scope.filterStr)
        .then(
            function onSuccess(response)
            {
                scope.page += 1;
                if (scope.reloading)
                {
                    scope.reloading = false;
                }

                _.each(response.data.object_list, function (obj) {
                    scope.object_list.push(obj);
                });

                if (response.data.end_index === response.data.total_count) {
                    scope.nomore = true;
                }
                scope.loading = false;
            },
            function onError(response) {
                scope.error = response.data;
                scope.loading = false;

                if (scope.reloading) {
                    scope.reloading = false;
                }
            }
        );
      }

      function reload() {
        scope.nomore = false;
        scope.page = 1;
        scope.reloading = true;
        scope.object_list.splice(0, scope.object_list.length);

        loadMore();
      }

      // debounced reloading
      function reloadDebounce() {
        $timeout.cancel(scope.filterTimeout);
        scope.filterTimeout = $timeout(function() {
          scope.reload();
        }, 500);
      }

      // debounced filter options
      scope.$watch("filterOptions", function(newOpts, oldOpts) {
        if (_.isEqual(newOpts, oldOpts)) {
          return;
        }
        reloadDebounce();
      }, true);

      // debounced filter
      scope.$watch("filterStr", function(newStr, oldStr) {
        if (newStr === oldStr) {
          return;
        }
        reloadDebounce();
      });

      // overflow-x needs to resize the height
      var dataElement = angular.element(".data-table");
      /* jshint ignore:start */
      scope.resizeSensor = new ResizeSensor(dataElement, function() {
        if (dataElement.width() > $(element).width()) {
          $(element).width(dataElement.width());
          $(element).parent().css('overflow-x', 'auto');
        }
      });
      /* jshint ignore:end */
      scope.$on("$destroy", function() { delete scope.resizeSensor; });

      scope.canCreateBallotBox = (
        ElectionsApi.getCachedEditPerm(scope.electionId).indexOf('add-ballot-boxes')  !== -1
      );

      scope.createBallotBox = function()
      {
        $modal.open({
          templateUrl: "avAdmin/admin-directives/ballot-box/create-ballot-box-modal.html",
          controller: "CreateBallotBoxModal",
          size: 'lg',
          resolve: {}
        })
        .result.then(function(textarea) {
          $modal.open({
              templateUrl: "avAdmin/admin-directives/ballot-box/checking-ballot-box-modal.html",
              controller: "CheckingBallotBoxModal",
              size: 'lg',
              resolve: {
                electionId: function () { return scope.electionId; },
                textarea: function () { return textarea; },
                errorFunc: function ()
                {
                  function errorFunction(data)
                  {
                    if (_.isBoolean(data)) {
                      scope.error = data;
                    }
                  return scope.error;
                  }
                  return errorFunction;
                }
              }
          })
          .result.then(
            scope.reload,
            function onError(error) {
              scope.reload();
            }
          );
        });
      };

      // list of row commands
      scope.row_commands = [
        {
          text: $i18next("avAdmin.ballotBox.viewTallySheetAction"),
          iconClass: 'fa fa-file',
          actionFunc: function(ballotBox)
          {
            Authmethod.getTallySheet(
              ballotBox.event_id,
              ballotBox.id,
              null
            )
          .then(
            function onSuccess(response)
            {
              $modal.open({
                templateUrl: "avAdmin/admin-directives/ballot-box/view-tally-sheet-modal.html",
                controller: "ViewTallySheetModal",
                windowClass: "view-tally-sheet-modal",
                resolve: {
                  tallySheet: function () { return response.data; },
                  allowEdit: function () { 
                    // return edit tally sheet enableFunc
                    return scope.row_commands[1].enableFunc(ballotBox); 
                  },
                  ballotBox: function () { return ballotBox; },
                  electionId: function () { return ballotBox.event_id; },
                }
              })
              .result.then(
                function (action) {
                  if (action === "edit-tally-sheet") {
                    scope.row_commands[1].actionFunc(ballotBox);
                  }
                },
                function onError(error) {
                  scope.reload();
                }
              );
            }
          );
          },
          enableFunc: function(ballotBox) {
            return (
              ballotBox.num_tally_sheets > 0 &&
              ElectionsApi.getCachedEditPerm(scope.electionId).indexOf('list-tally-sheets') !== -1
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["list-tally-sheets", "edit"]);
          }
        },
        {
          text: $i18next("avAdmin.ballotBox.writeTallySheetAction"),
          iconClass: 'fa fa-edit',
          actionFunc: function(ballotBox)
          {
            Authmethod.getTallySheet(
              ballotBox.event_id,
              ballotBox.id,
              null
            )
            .then(
              function onSuccess(response)
              {
                ElectionsApi
                  .getElection(ballotBox.event_id)
                  .then(
                    function onSuccess(election) 
                    {
                      $modal.open({
                        templateUrl: "avAdmin/admin-directives/ballot-box/write-tally-sheet-modal.html",
                        controller: "WriteTallySheetModal",
                        windowClass: "write-tally-sheet-modal",
                        resolve: {
                          tallySheet: function () { return response.data; },
                          ballotBox: function () { return ballotBox; },
                          election: function () { return election; }
                        }
                      })
                      .result.then(
                        scope.reload,
                        function onError(error) {
                          scope.reload();
                        }
                      );
                    },
                    function onError(error) {
                      scope.reload();
                    }
                  );
              },
              function onError(response)
              {
                ElectionsApi
                  .getElection(ballotBox.event_id)
                  .then(
                    function onSuccess(election) 
                    {
                      $modal.open({
                        templateUrl: "avAdmin/admin-directives/ballot-box/write-tally-sheet-modal.html",
                        controller: "WriteTallySheetModal",
                        windowClass: "write-tally-sheet-modal",
                        resolve: {
                          tallySheet: function () { return null; },
                          ballotBox: function () { return ballotBox; },
                          election: function () { return election; }
                        }
                      })
                      .result.then(
                        scope.reload,
                        function onError(error) {
                          scope.reload();
                        }
                      );
                    },
                    function onError(error) {
                      scope.reload();
                    }
                  );
              }
            );
          },
          enableFunc: function(ballotBox) {
            return (
              ['stopped', 'tally_ok', 'results_ok', 'doing_tally', 'tally_error','results_pub'].indexOf(ElectionsApi.currentElection.status) !== -1 && (
                (
                ballotBox.num_tally_sheets > 0 &&
                ElectionsApi.getCachedEditPerm(scope.electionId).indexOf('override-tally-sheets') !== -1
                ) || (
                  ballotBox.num_tally_sheets === 0 &&
                  ElectionsApi.getCachedEditPerm(scope.electionId).indexOf('add-tally-sheets') !== -1
                )
              )
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["override-tally-sheets", "add-tally-sheets"]);
          }
        },
        {
          text: $i18next("avAdmin.ballotBox.deleteTallySheetAction"),
          iconClass: 'fa fa-minus-square',
          actionFunc: function(ballotBox)
          {
             Authmethod.getTallySheet(
              ballotBox.event_id,
              ballotBox.id,
              null
            )
          .then(
            function onSuccess(response)
            {
              $modal.open({
                templateUrl: "avAdmin/admin-directives/ballot-box/delete-tally-sheet-modal.html",
                controller: "DeleteTallySheetModal",
                resolve: {
                  ballotBox: function () { return ballotBox; },
                  tallySheetId: function () { return response.data.id; },
                  electionId: function () { return ballotBox.event_id; },
                }
              })
              .result.then(
                scope.reload,
                function onError(error) {
                  scope.reload();
                }
              );
            });
          },
          enableFunc: function(ballotBox) {
            return (
              ['stopped', 'tally_ok', 'results_ok', 'doing_tally', 'tally_error','results_pub'].indexOf(ElectionsApi.currentElection.status) !== -1 &&
              ballotBox.num_tally_sheets > 0 &&
              ElectionsApi.getCachedEditPerm(scope.electionId).indexOf('delete-tally-sheets') !== -1
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["delete-tally-sheets"]);
          }
        },
        {
          text: $i18next("avAdmin.ballotBox.deleteBallotBoxAction"),
          iconClass: 'fa fa-times',
          actionFunc: function(ballotBox)
          {
            $modal.open({
              templateUrl: "avAdmin/admin-directives/ballot-box/delete-ballot-box-modal.html",
              controller: "DeleteBallotBoxModal",
              resolve: {
                ballotBox: function () { return ballotBox; },
                electionId: function () { return scope.electionId; },
              }
            })
            .result.then(
              scope.reload,
              function onError(error) {
                scope.reload();
              }
            );
          },
          enableFunc: function(ballotBox) {
            return (
              ElectionsApi.getCachedEditPerm(scope.electionId).indexOf('delete-ballot-boxes') !== -1
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["delete-ballot-boxes"]);
          }
        }
      ];

      angular.extend(scope, {
        loadMore: loadMore,
        reload: reload
      });

      if ($location.search().view_ballot_box_name)
      {
        scope.filterStr = $location.search().view_ballot_box_name;
        scope.reload();
      } else if ($location.search().view_tally_sheet_id && $location.search().ballot_box_id)
      {
        Authmethod.getBallotBoxes(
          scope.electionId,
          1,
          null,
          {ballotbox__id__equals: $location.search().ballot_box_id},
          ""
        )
        .then(
          function onSuccess(response)
          {
            if (response.data.total_count !== 1) {
              return;
            }
            var ballotBox = response.data.object_list[0];

            Authmethod.getTallySheet(
              ballotBox.event_id,
              ballotBox.id,
              $location.search().view_tally_sheet_id
            )
            .then(
              function onSuccess(tallySheetResponse)
              {
                $modal.open({
                  templateUrl: "avAdmin/admin-directives/ballot-box/view-tally-sheet-modal.html",
                  controller: "ViewTallySheetModal",
                  windowClass: "view-tally-sheet-modal",
                  resolve: {
                    tallySheet: function () { return tallySheetResponse.data; },
                    allowEdit: function () { 
                      // return edit tally sheet enableFunc
                      return scope.row_commands[1].enableFunc(ballotBox); 
                    },
                    ballotBox: function () { return ballotBox; },
                    electionId: function () { return ballotBox.event_id; },
                  }
                })
                .result.then(
                  function (action) {
                    if (action === "edit-tally-sheet") {
                      scope.row_commands[1].actionFunc(ballotBox);
                    }
                  },
                  function onError(error) {
                    scope.reload();
                  }
                );
              }
            );
          }
        );

      } else if ($location.search().view_tally_sheet_from_action_id && $location.search().ballot_box_id && $location.search().ballot_box_name)
      {
        var action_id = $location.search().view_tally_sheet_from_action_id;
        var ballot_box_id = $location.search().ballot_box_id;
        var ballot_box_name = $location.search().ballot_box_name;
        Authmethod.getActivity(
          scope.electionId,
          1,
          null,
          {
            activity__id__equals: action_id
          }
        )
        .then(
          function onSuccess(response)
          {
            if (response.data.total_count !== 1) {
              return;
            }
            var action = response.data.activity[0];

            $modal.open({
              templateUrl: "avAdmin/admin-directives/ballot-box/view-tally-sheet-modal.html",
              controller: "ViewTallySheetModal",
              windowClass: "view-tally-sheet-modal",
              resolve: {
                tallySheet: function () { return action.metadata; },
                allowEdit: function () { 
                  // return edit tally sheet enableFunc
                  return scope.row_commands[1].enableFunc({
                    id: ballot_box_id,
                    name: ballot_box_name,
                    num_tally_sheets: 1
                  }); 
                },
                ballotBox: function () {
                  return {
                    id: ballot_box_id,
                    name: ballot_box_name
                  };
                },
                electionId: function () { return scope.electionId; },
              }
            });
          }
        );
      }

      scope.reload();
    }

    return {
      restrict: 'AE',
      scope: {},
      link: link,
      templateUrl: 'avAdmin/admin-directives/ballot-box/ballot-box.html'
    };
  });
