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
    'avAdminElcensus',
    function(
      $window,
      $http,
      ElectionsApi,
      PdfMakeService,
      Authmethod,
      moment,
      Plugins,
      SendMsg,
      $modal,
      MustExtraFieldsService,
      $filter,
      $stateParams,
      $state,
      $timeout,
      ConfigService,
      CsvLoad,
      NextButtonService)
    {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
      scope.census = ['open', 'close'];
      scope.election = ElectionsApi.currentElection;
      scope.newcensus = {};
      scope.electionLoaded = false;
      scope.reloadingCensus = false;
      scope.loading = false;
      scope.nomore = false;
      scope.error = null;
      scope.page = 1;
        
      scope.msg = null;
      scope.filterStr = "";
      scope.$filter = $filter;
      scope.filterTimeout = null;
      scope.filterOptions = {};
      scope.resizeSensor = null;
      scope.helpurl = ConfigService.helpUrl;
      scope.showSuccessAction = ConfigService.showSuccessAction;
      scope.comment = {
        activateComment: "",
        deactivateComment: ""
      };

      function childrenElectionNames(metadata) {
        if (!metadata.children_event_id_list) {
          return [];
        } else {
          return _.map(
            metadata.children_event_id_list,
            function (electionId) {
              return scope.election.childrenElectionNames[electionId] || electionId;
            }
          );
        }
      }

      scope.goNext = NextButtonService.goNext;

      function newElection() {
        return !$stateParams.id;
      }


      function selectQueried(selectStatus) {
        _.each(scope.election.census.voters,
          function (i) {
            i.selected = selectStatus;
          });
      }

      function addEmptyImage(images, name) 
      {
        // empty 1px image
        images[name] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6fwYAAtMBznRijrsAAAAASUVORK5CYII=';
      }

      function isEmptyImage(images, name) 
      {
        return images[name] === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGP6fwYAAtMBznRijrsAAAAASUVORK5CYII=';
      }

      function isSvgImage(images, name)
      {
        return images[name] !== undefined && !images[name].startsWith('data:image');
      }

      function addImageBlob(images, name, blob) {
          // blob data to URL
          var reader = new FileReader();
          reader.onload = function(event) {
            images[name] = event.target.result;
          };
          reader.readAsDataURL(blob);
      }

      function addSvgImage(images, name, blob) {
          // blob data to text
          var reader = new FileReader();
          reader.onload = function(event) {
            images[name] = event.target.result;
          };
          reader.readAsText(blob);
      }

      function getPdfImages() 
      {
        var images = {};
        $http({
          method: 'GET',
          url: (
            (
              scope.election.presentation.extra_options && 
              scope.election.presentation.extra_options.success_screen__ballot_ticket__logo_url
            ) || 
            scope.election.logo_url || 
            ConfigService.organization.orgBigLogo
          ),
          headers: {
            'Content-Type': 'image/png'
          },
          responseType: 'blob' 
        }).then(
          function onSuccess(response) {
            // this seems like a svg, add it as such
            if (!response.data || !response.data.type.startsWith('image/'))
            {
              addEmptyImage(images, 'logo');
            } else if (response.data.type.startsWith('image/svg')) 
            {
              addSvgImage(images, 'logo', response.data);
            } else {
              addImageBlob(images, 'logo', response.data);
            }
          },
          function onError() {
            addEmptyImage(images, 'logo');
          }
        );
        return images;
      }

      function getAuthenticationUrl(voter) {
        return (
          window.location.protocol + 
          '//' + 
          window.location.host + 
          '/election/' + 
          scope.election.id + 
          '/public/login-with-code/' + 
          voter.username
        );
      }

      function getPdfFilename(voter) {
        return (
          'auth_codes_' + scope.election.id + '_' + voter.username + '.pdf'
        );
      }

      function getTitleSubtitleColumn() 
      {
        return [
          {
            text: scope.election.presentation.extra_options && scope.election.presentation.extra_options.success_screen__ballot_ticket__logo_header || ConfigService.organization.orgName,
            style: 'h1'
          },
          {
            text: scope.election.presentation.extra_options && scope.election.presentation.extra_options.success_screen__ballot_ticket__logo_subheader || ConfigService.organization.orgSubtitle || "",
            style: 'h2'
          },
        ];
      }

      function formatCode(code)
      {
        return _.map(
          _.range(0, code.length, 4),
          function (i) {
            return code.substr(i, 4);
          }
        ).join('-');
      }
            
      function generateAuthCodePdf(voter, codeInfo) {
        var authenticationUrl =  getAuthenticationUrl(voter);
        scope.pdf.fileName = getPdfFilename(voter);
        var docDefinition = {
          info: {
            title: scope.pdf.fileName,
          },
          content: [
            isEmptyImage(scope.pdf.images, 'logo') ? getTitleSubtitleColumn() : {
              columns: [
                isSvgImage(scope.pdf.images, 'logo') ? {
                  svg: scope.pdf.images['logo'],
                  fit: [200, 200]
                } : {
                  image: 'logo',
                  fit: [200, 200]
                },
                getTitleSubtitleColumn()
              ]
            },
            {
              text: $window.i18next.t('avAdmin.census.generatePDFAuthCodes.header'),
              style: 'h3'
            },
            {
              columns: [
                {
                  text: $window.i18next.t('avAdmin.census.generatePDFAuthCodes.username'),
                  style: 'cell',
                  width: '40%'
                },
                {
                  text: voter.username,
                  style: 'cell',
                  width: '*'
                }
              ]
            },
            {
              columns: [
                {
                  text: $window.i18next.t('avAdmin.census.generatePDFAuthCodes.userId'),
                  style: 'cell',
                  width: '40%'
                },
                {
                  text: voter.id,
                  style: 'cell',
                  width: '*'
                }
              ]
            },
            {
              columns: [
                {
                  text: $window.i18next.t('avAdmin.census.generatePDFAuthCodes.authCode'),
                  style: 'cell',
                  width: '40%'
                },
                {
                  text: codeInfo.code,
                  style: 'cell',
                  width: '*'
                }
              ]
            },
            {
              columns: [
                {
                  text: $window.i18next.t('avAdmin.census.generatePDFAuthCodes.codeCreated'),
                  style: 'cell',
                  width: '40%'
                },
                {
                  text: moment(codeInfo.created)
                        .format('YYYY-MM-DD HH:mm:ss'),
                  style: 'cell',
                  width: '*'
                }
              ]
            },
            {
              columns: [
                {
                  text: $window.i18next.t('avAdmin.census.generatePDFAuthCodes.authLink'),
                  width: '40%',
                  style: 'cell'
                },
                {
                  text: authenticationUrl,
                  link: authenticationUrl,
                  width: '*',
                  style: 'link'
                }
              ]
            },
            {
              columns: [
                {
                  text: '',
                  width: '*'
                },
                {
                  text: $window.i18next.t('avAdmin.census.generatePDFAuthCodes.qrCode'),
                  style: 'p',
                  width: 'auto'
                },
                {
                  text: '',
                  width: '*'
                }
              ]
            },
            {
              columns: [
                {
                  text: '',
                  width: '*'
                },
                {
                  qr: authenticationUrl,
                  fit: 180
                },
                {
                  text: '',
                  width: '*'
                }
              ]
            }
          ],
          images: scope.pdf.images,
          styles: {
            h1: {
              fontSize: 18,
              bold: true,
              margin: [0, 0, 0, 10]
            },
            h2: {
              fontSize: 16,
              bold: false,
              margin: [0, 10, 0, 5]
            },
            h3: {
              fontSize: 16,
              bold: true,
              margin: [0, 20, 0, 10]
            },
            h4: {
              fontSize: 14,
              bold: true,
              margin: [0, 10, 0, 10]
            },
            cell: {
              fontSize: 12,
              bold: false,
              margin: 7
            },
            link: {
              fontSize: 12,
              bold: true,
              decoration: 'underline',
              color: '#0000ff',
              margin: 7
            },
            p: {
              fontSize: 14,
              bold: false,
              margin: 15
            },
            demo: {
              fontSize: 16,
              bold: true,
              background: '#f0ad4e',
              margin: 15
            }
          }
        };
        scope.pdf.value = PdfMakeService.createPdf(docDefinition);
        scope.pdf.value.download(scope.pdf.fileName);
      }

      function generatePDFAuthCodes (voter) {
        $modal
          .open({
            templateUrl: "avAdmin/admin-directives/dashboard/admin-confirm-modal.html",
            controller: "AdminConfirmModal",
            size: 'lg',
            resolve: {
              dialogName: function () { return "generatePDFAuthCodes"; },
              data: function () { return ""; },
            }
          })
          .result
          .then(
            function confirmed() 
            {
              Authmethod.obtainVoterAuthCode(scope.election.id, voter.username)
                .then(
                  function onSuccess(response) 
                  {
                    scope.msg = "avAdmin.census.generatePDFAuthCodesSuccess";
                    scope.error = "";
                    var codeInfo = {
                      code: formatCode(response.data.code),
                      created: response.data.created
                    };
                    generateAuthCodePdf(voter, codeInfo);
                  }, 
                  function onError(response) {
                    scope.msg = "";
                    scope.error = response.data;
                  }
                );
            }
          );
      }
      
      function sendAuthCodesSelected() {
        var selectedList = scope.selected(scope.shown());
        var user_ids = _.pluck(selectedList, "id");

        SendMsg.setElection(scope.election);
        SendMsg.scope = scope;
        SendMsg.user_ids = user_ids;
        SendMsg.sendAuthCodesModal();

        return false;
      }

      scope.pdf = {value: null, fileName: '', images: getPdfImages()};
      scope.commands = [
        {
          i18nString: 'addPersonAction',
          iconClass: 'fa fa-plus',
          actionFunc: function() { return scope.addPersonModal(); },
          enableFunc: function() {
            return (
              scope.perms.val.indexOf("census-add") !== -1 ||
              scope.perms.val.indexOf("edit") !== -1 ||
              scope.election.id === undefined
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["census-add", "edit"]);
          }
        },
        {
          i18nString: 'addCsvAction',
          iconClass: 'fa fa-plus',
          actionFunc: function() { return scope.addCsvModal(); },
          enableFunc: function() {
            return (
              scope.perms.val.indexOf("census-add") !== -1 ||
              scope.perms.val.indexOf("edit") !== -1 ||
              scope.election.id === undefined
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["census-add", "edit"]);
          }
        },
        {
          i18nString: 'exportCensusAction',
          iconClass: 'fa fa-download',
          actionFunc: function() { return scope.exportCensusModal(); },
          enableFunc: function() {
            return (
              scope.election && scope.election.census &&
              scope.election.census.voters &&
              scope.election.census.voters.length &&
              (
                scope.perms.val.indexOf("view-census") !== -1 ||
                scope.perms.val.indexOf("edit") !== -1
              )
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["view-census", "edit"]);
          }
        },
        {
          i18nString: 'selectAllShownAction',
          iconClass: 'fa fa-check-square-o',
          actionFunc: function() { return scope.selectQueried(true); },
          enableFunc: function() { return scope.shown().length > 0; },
          permsFunc: function() {
            return true;
          }
        },
        {
          i18nString: 'deselectAllShownAction',
          iconClass: 'fa fa-square-o',
          actionFunc: function() { return selectQueried(false); },
          enableFunc: function() { return scope.numSelected(scope.shown()) > 0; },
          permsFunc: function() {
            return true;
          }
        },
        {
          i18nString: 'activateAction',
          iconClass: 'fa fa-user',
          actionFunc: function() {
            $modal.open({
              templateUrl: "avAdmin/admin-directives/elcensus/confirm-activate-people-modal.html",
              controller: "ConfirmActivatePeopleModal",
              size: 'lg',
              resolve: {
                comment: function () { return scope.comment; },
                election: function () { return scope.election; },
                numSelectedShown: function() {
                  return scope.numSelected(scope.shown());
                }
              }
            }).result.then(scope.activateSelected);
          },
          enableFunc: function() {
            return (
              scope.election &&
              scope.election.id &&
              scope.numSelected(scope.shown()) > 0 &&
              (
                scope.perms.val.indexOf("census-activation") !== -1 ||
                scope.perms.val.indexOf("edit") !== -1
              )
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["census-activation", "edit"]);
          }
        },
        {
          i18nString: 'deactivateAction',
          iconClass: 'fa fa-user-times',
          actionFunc: function() {
            $modal.open({
              templateUrl: "avAdmin/admin-directives/elcensus/confirm-deactivate-people-modal.html",
              controller: "ConfirmDeactivatePeopleModal",
              size: 'lg',
              resolve: {
                comment: function () { return scope.comment; },
                election: function () { return scope.election; },
                numSelectedShown: function() {
                  return scope.numSelected(scope.shown());
                }
              }
            }).result.then(scope.deactivateSelected);
          },
          enableFunc: function() {
            return (
              scope.election &&
              scope.election.id &&
              scope.numSelected(scope.shown()) > 0 &&
              (
                scope.perms.val.indexOf("census-activation") !== -1 ||
                scope.perms.val.indexOf("edit") !== -1
              )
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["census-activation", "edit"]);
          }
        },
        {
          i18nString: 'removeCensusAction',
          iconClass: 'fa fa-trash-o',
          actionFunc: function() {
            $modal.open({
              templateUrl: "avAdmin/admin-directives/elcensus/confirm-remove-people-modal.html",
              controller: "ConfirmRemovePeopleModal",
              size: 'lg',
              resolve: {
                election: function () { return scope.election; },
                comment: function () { return scope.comment; },
                numSelectedShown: function() {
                  return scope.numSelected(scope.shown());
                }
              }
            }).result.then(scope.removeSelected);
          },
          enableFunc: function() {
            return (
              scope.numSelected(scope.shown()) > 0 &&
              (
                scope.perms.val.indexOf("census-delete") !== -1 &&
                (
                  scope.numSelected(
                    scope.shown(),
                    function (voter) {
                      return voter.voted_children_elections.length > 0;
                    }
                  ) === 0 ||
                  scope.perms.val.indexOf("census-delete-voted") !== -1
                ) || 
                scope.perms.val.indexOf("edit") !== -1
              )
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["census-delete", "census-delete-voted", "edit"]);
          }
        },
        {
          i18nString: 'sendAuthCodesAction',
          iconClass: 'fa fa-paper-plane-o',
          actionFunc: function() { return sendAuthCodesSelected(); },
          enableFunc: function() {
            return (
              scope.numSelected(scope.shown()) > 0  &&
              (
                scope.perms.val.indexOf("send-auth") !== -1 ||
                scope.perms.val.indexOf("edit") !== -1
              )
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["send-auth", "edit"]);
          }
        }
      ];

      function selectVoter(voter) {
        _.each(scope.election.census.voters, function (v) { v.selected = false; });
        voter.selected = true;
      }

      function resetVoterToPreRegistration(voter) {
        $modal
          .open({
            templateUrl: "avAdmin/admin-directives/dashboard/admin-confirm-modal.html",
            controller: "AdminConfirmModal",
            size: 'lg',
            resolve: {
              dialogName: function () { return "resetVoterToPreRegistration"; },
              data: function () { return " "; },
            }
          })
          .result
          .then(
            function confirmed(comment) 
            {
              Authmethod
                .resetVotersToPreRegistration(
                  scope.election.id,
                  [voter.id],
                  comment
                )
                .then(
                  function onSuccess(_response) 
                  {
                    scope.msg = "avAdmin.tasks.resetVoterToPreRegistrationSuccess";
                    scope.error = "";
                    scope.reloadCensus();
                  },
                  function onError(response) {
                    scope.msg = "";
                    scope.error = response.data;
                  }
                );
            }
          );
      }

      scope.row_commands = [
        {
	        text: "avAdmin.census.viewActivityOneAction",
          iconClass: 'fa fa-pie-chart',
          actionFunc: function(voter) {
            // go to activity-log for this voter
            $state.go(
              'admin.activityLog',
              {id: scope.election.id, q: voter.username}
            );
          },
          enableFunc: function() {
            return (
              scope.election &&
              scope.election.id && (
                scope.perms.val.indexOf("event-view-activity") !== -1 ||
                scope.perms.val.indexOf("edit") !== -1
              )
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["event-view-activity", "edit"]);
          }
        },
        {
	        text: "avAdmin.census.activateOneAction",
          iconClass: 'fa fa-user',
          actionFunc: function(voter) {
	          selectVoter(voter);
            $modal.open({
              templateUrl: "avAdmin/admin-directives/elcensus/confirm-activate-people-modal.html",
              controller: "ConfirmActivatePeopleModal",
              size: 'lg',
              resolve: {
                comment: function () { return scope.comment; },
                election: function () { return scope.election; },
                numSelectedShown: function() {
                  return scope.numSelected(scope.shown());
                }
              }
            }).result.then(scope.activateSelected);
          },
          enableFunc: function() {
            return (
              scope.election &&
              scope.election.id && (
                scope.perms.val.indexOf("census-activation") !== -1 ||
                scope.perms.val.indexOf("edit") !== -1
              )
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["census-activation", "edit"]);
          }
        },
        {
	        text: "avAdmin.census.deactivateOneAction",
          iconClass: 'fa fa-user-times',
          actionFunc: function(voter) {
            selectVoter(voter);
            $modal.open({
              templateUrl: "avAdmin/admin-directives/elcensus/confirm-deactivate-people-modal.html",
              controller: "ConfirmDeactivatePeopleModal",
              size: 'lg',
              resolve: {
                comment: function () { return scope.comment; },
                election: function () { return scope.election; },
                numSelectedShown: function() {
                  return scope.numSelected(scope.shown());
                }
              }
            }).result.then(scope.deactivateSelected);
          },
          enableFunc: function() {
            return (
              scope.election &&
              scope.election.id && (
                scope.perms.val.indexOf("census-activation") !== -1 ||
                scope.perms.val.indexOf("edit") !== -1
              )
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["census-activation", "edit"]);
          }
        },
        {
	        text: "avAdmin.census.removeCensusOneAction",
          iconClass: 'fa fa-trash-o',
          actionFunc: function(voter) {
            selectVoter(voter);
            $modal.open({
              templateUrl: "avAdmin/admin-directives/elcensus/confirm-remove-people-modal.html",
              controller: "ConfirmRemovePeopleModal",
              size: 'lg',
              resolve: {
                election: function () { return scope.election; },
                comment: function () { return scope.comment; },
                numSelectedShown: function() {
                  return scope.numSelected(scope.shown());
                }
              }
            }).result.then(scope.removeSelected);
          },
          enableFunc: function(voters) {
            return (
              (
                scope.perms.val.indexOf("census-delete") !== -1 &&
                (
                  voters[0].voted_children_elections.length === 0 ||
                  scope.perms.val.indexOf("census-delete-voted") !== -1
                )
              ) ||
              scope.perms.val.indexOf("edit") !== -1
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["census-delete", "edit"]);
          }
        },
        {
	        text: "avAdmin.census.sendAuthCodesOneAction",
          iconClass: 'fa fa-paper-plane-o',
          actionFunc: function(voter) {
            selectVoter(voter);
            return sendAuthCodesSelected();
          },
          enableFunc: function() {
            return (
              scope.perms.val.indexOf("send-auth") !== -1 ||
              scope.perms.val.indexOf("edit") !== -1
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["send-auth", "edit"]);
          }
        },
        {
	        text: "avAdmin.census.generatePDFAuthCodesAction",
          iconClass: 'fa fa-file-pdf-o',
          actionFunc: function(voter) {
            return generatePDFAuthCodes(voter);
          },
          enableFunc: function() {
            return (
              scope.perms.val.indexOf("generate-auth-code") !== -1 ||
              scope.perms.val.indexOf("edit") !== -1
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["generate-auth-code", "edit"]);
          }
        },
        {
          text: "avAdmin.census.resetVoterToPreRegistration",
          iconClass: 'fa fa-file-pdf-o',
          actionFunc: function(voter) {
            return resetVoterToPreRegistration(voter);
          },
          enableFunc: function(voters) {
            return (
              (
                scope.perms.val.indexOf("reset-voter") !== -1 ||
                scope.perms.val.indexOf("edit") !== -1
              ) &&
              voters[0].voted_children_elections.length === 0
            );
          },
          permsFunc: function() {
            return scope.hasPerms(["reset-voter", "edit"]);
          }
        }
      ];

      function censusCall(id, csExport, opt) {
          // this hook can avoid the addCensus call
          if (Plugins.hook('add-to-census-pre', csExport)) {
              Authmethod
                .addCensus(id, csExport, opt)
                .then(
                  function onSuccess(response) {
                    scope.loading = false;
                    scope.msg = "avAdmin.census.censusadd";
                    scope.reloadCensus();
                    Plugins.hook(
                      'add-to-census-success',
                      {data: csExport, response: response.data}
                    );
                  },
                  function onError(response) {
                    scope.loading = false;
                    if (
                      response.data &&
                      response.data.error_codename === "invalid_credentials"
                    ) {
                      scope.error = $window.i18next.t(
                        "avAdmin.dashboard.modals.addCensus.errorInvalidCensusData"
                      );
                    } else {
                      scope.error = response.data.error_codename;
                    }
                    Plugins.hook(
                      'add-to-census-error',
                      {data: csExport, response: response.data}
                    );
                    Plugins.hook('census-csv-load-error', response.data);
                  }
                );
          }
      }

      function addToCensus(verifyCensus) {
          var election = scope.election;
          var census = [];
          if (!election.id) {
            census = election.census.voters;
            census.push({
              selected: false, 
              vote: false, 
              username: "", 
              metadata: scope.newcensus,
              childrenElectionNames: childrenElectionNames(scope.newcensus)
            });
          } else {
            census.push({
              selected: false, 
              vote: false, 
              username: "", 
              metadata: scope.newcensus,
              childrenElectionNames: childrenElectionNames(scope.newcensus)
            });

            var csExport = _.map(
              census, 
              function (censusElement) 
              {
                // if it's a parent election, process children elections
                if (election.children_election_info) 
                {
                  censusElement.metadata.children_event_id_list = _.filter(
                    election.children_election_info.natural_order,
                    function (electionId) 
                    {
                      var ret = (censusElement.metadata[electionId].trim().toLowerCase() === "true");
                      delete censusElement.metadata[electionId];
                      return ret;
                    }
                  );
                }
                return censusElement.metadata;
              }
            );
            scope.loading = true;
            censusCall(election.id, csExport, !!verifyCensus ? 'enabled' : 'disabled');
          }
          scope.newcensus = {};
      }

      function delVoter(index) {
          var el = scope.election;
          var cs = el.census.voters;
          el.census.voters = cs.slice(0, index).concat(cs.slice(index+1,cs.length));
      }

      function exportCensus(el) {
        var cs = el.census.voters;
        var csExport = _.map(cs, function (i) {
          var ret = angular.copy(i.metadata);
          if (i.has_activity) {
            ret.has_activity = "true";
          } else {
            ret.has_activity = "false";
          }
          if (!el.children_election_info) {
            if (i.voted_children_elections.length === 0) {
              ret.vote = "false";
            } else {
              ret.vote = "true";
            }
          } else {
            _.each(
              scope.election.children_election_info.natural_order, 
              function (electionId) 
              {
                if (i.voted_children_elections.indexOf(electionId) !== -1) 
                {
                  ret["voted in " + scope.election.childrenElectionNames[electionId]] = "true";
                } else {
                  ret["voted in " + scope.election.childrenElectionNames[electionId]] = "false";
                }
                delete i.metadata.children_event_id_list;
              }
            );
          }
          ret.voterid = i.username;
          return ret;
        });
        var text = $window.Papa.unparse(angular.toJson(csExport));
        var blob = new $window.Blob([text], {type: "text/csv"});
        $window.saveAs(blob, el.id + "-census"+".csv");
        return false;
      }

      function exportCensusModal() {
        $modal.open({
          templateUrl: "avAdmin/admin-directives/elcensus/export-all-census-modal.html",
          controller: "ExportAllCensusModal",
          size: 'lg',
          resolve: {
            election: function () { return scope.election; },
            filterStr: function () { return scope.filterStr; },
            filterOptions: function () { return scope.filterOptions; }
          }
        }).result.then(exportCensus);
      }

      function removeSelected() {
        var selectedList = scope.selected(scope.shown());
        if (!scope.election.id) {
          _.each(selectedList, function (selected) {
            var i = scope.election.census.voters.indexOf(selected);
            delVoter(i);
          });
        } else {
          var user_ids = _.pluck(selectedList, "id");
          var comment = (this.comment) ? this.comment : undefined;
          Authmethod
            .removeUsersIds(scope.election.id, scope.election, user_ids, comment)
            .then(
              function(response) {
                scope.loading = false;
                scope.msg = "avAdmin.census.removedCensusSuccessfully";
                scope.reloadCensus();
              },
              function onError(response) {
                scope.loading = false; 
                scope.error = response.data.error;
              }
            );
        }
        return false;
      }

      function activateSelected() {
        var selectedList = scope.selected(scope.shown());
        var user_ids = _.pluck(selectedList, "id");
        var comment = scope.comment.activateComment;
        Authmethod
          .activateUsersIds(scope.election.id, scope.election, user_ids, comment)
          .then(
            function(response) {
              scope.loading = false;
              scope.comment.activateComment = "";
              scope.msg = "avAdmin.census.activatedCensusSuccessfully";
              scope.reloadCensus();
            },
            function onError(response) {
              scope.loading = false; 
              scope.error = response.data.error;
            }
          );
        return false;
      }

      function deactivateSelected() {
        var selectedList = scope.selected(scope.shown());
        var user_ids = _.pluck(selectedList, "id");
        var comment = scope.comment.deactivateComment;
        Authmethod
          .deactivateUsersIds(scope.election.id, scope.election, user_ids, comment)
          .then(function(response) {
              scope.loading = false;
              scope.comment.deactivateComment = "";
              scope.msg = "avAdmin.census.activatedCensusSuccessfully";
              scope.reloadCensus();
            },
            function onError(response) {
              scope.loading = false; 
              scope.error = response.data.error;
            }
          );
        return false;
      }

      function addCsvModal() {
        $modal.open({
          templateUrl: "avAdmin/admin-directives/elcensus/add-csv-modal.html",
          controller: "AddCsvModal",
          size: 'lg',
          resolve: {
            election: function () { return scope.election; }
          }
        }).result.then(function(result) {
          var textarea = result.textarea;
          var verifyCensus = result.verifyCensus;
          if (!!scope.election.id) {
            $modal.open({
              templateUrl: "avAdmin/admin-directives/elcensus/csv-loading-modal.html",
              controller: "CsvLoadingModal",
              size: 'lg',
              resolve: {
                election: function () { return scope.election; },
                textarea: function () { return textarea; },
                verifyCensus: function () { return verifyCensus; },
                errorFunc: function () {
                  function errorFunction(data) {
                    if (angular.isString(data)) {
                      if (data === "invalid_credentials") {
                        scope.error = $window.i18next.t("avAdmin.dashboard.modals.addCensus.errorInvalidCensusData");
                      } else {
                        scope.error = data;
                      }
                    }
                    return scope.error;
                  }
                  return errorFunction;
                }
              }
            })
            .result.then(
              scope.reloadCensus,
              function (error) {
                Plugins.hook('census-csv-load-error', error);
                scope.reloadCensus();
              });
          } else {
            var data = {
              election: scope.election,
              textarea: textarea,
              verifyCensus: verifyCensus
            };
            CsvLoad.processCsv(data);
          }
        });
      }

      function addPersonModal() {
        $modal.open({
          templateUrl: "avAdmin/admin-directives/elcensus/add-person-modal.html",
          controller: "AddPersonModal",
          size: 'lg',
          resolve: {
            election: function () { return scope.election; },
            newcensus: function() { return scope.newcensus; }
          }
        }).result.then(function(verifyCensus) {
          scope.addToCensus(verifyCensus);
        });
      }

      /**
       * Load more census in infinite scrolling mode
       */
      function loadMoreCensus(reload) {
        if (!scope.electionLoaded || scope.loading || scope.nomore || newElection()) {
          if (scope.reloadingCensus) {
            scope.reloadingCensus = false;
          }
          return;
        }
        scope.loading = true;

        ElectionsApi.waitForCurrent(function () {
          if (!scope.hasPerms(["view-census", "edit"])) {
            return;
          }
          ElectionsApi.getCensus(
              scope.election,
              scope.page,
              30,
              scope.filterStr,
              scope.filterOptions)
            .then(function(el) {
              scope.page += 1;
              if (scope.reloadingCensus) {
                scope.reloadingCensus = false;
              }

              if (el.data.end_index === el.data.total_count) {
                scope.nomore = true;
              }
              scope.loading = false;
            })
            .catch(function(data) {
              scope.error = data;
              scope.loading = false;
              if (scope.reloadingCensus) {
                scope.reloadingCensus = false;
              }
            });
        });
      }

      function reloadCensus() {
        scope.nomore = false;
        scope.page = 1;
        if (!scope.electionLoaded || !scope.election || !scope.election.census || !scope.election.census.voters) {
          return;
        }
        scope.reloadingCensus = true;
        scope.election.census.voters.splice(0, scope.election.census.voters.length);

        loadMoreCensus();
      }

      function filteredVoters() {
        if (!scope.election || !scope.election.census || !scope.election.census.voters) {
          return [];
        } else if (!scope.filterStr || scope.electionLoaded && !!scope.election.id) {
          return scope.election.census.voters;
        } else {
          return $filter('filter')(scope.election.census.voters, scope.filterStr);
        }
      }

      function reloadCensusDebounce() {
        $timeout.cancel(scope.filterTimeout);
        scope.filterTimeout = $timeout(function() {
          scope.reloadCensus();
        }, 500);
      }

      // debounced filter options
      scope.$watch("filterOptions", function(newOpts, oldOpts) {
        if (!scope.electionLoaded || !scope.election.id || _.isEqual(newOpts, oldOpts)) {
          return;
        }
        reloadCensusDebounce();
      }, true);

      // debounced filter
      scope.$watch("filterStr", function(newStr, oldStr) {
        if (!scope.electionLoaded || !scope.election.id || newStr === oldStr) {
          return;
        }
        reloadCensusDebounce();
      });

      // overflow-x needs to resize the height
      var ael = angular.element(".censustable");
      /* jshint ignore:start */
      scope.resizeSensor = new ResizeSensor(ael, function() {
        if (ael.width() > $(element).width()) {
          $(element).width(ael.width());
          $(element).parent().css('overflow-x', 'auto');
        }
      });
      /* jshint ignore:end */
      scope.$on("$destroy", function() { delete scope.resizeSensor; });

      angular.extend(scope, {
        addToCensus: addToCensus,
        addPersonModal: addPersonModal,
        addCsvModal: addCsvModal,
        delVoter: delVoter,
        filteredVoters: filteredVoters,
        exportCensus: exportCensus,
        exportCensusModal: exportCensusModal,
        loadMoreCensus: loadMoreCensus,
        reloadCensus: reloadCensus,
        removeSelected: removeSelected,
        activateSelected: activateSelected,
        deactivateSelected: deactivateSelected,
        selectQueried: selectQueried,
        sendAuthCodesSelected: sendAuthCodesSelected,
        newElection: newElection,
        childrenElectionNames: childrenElectionNames,
        numSelected: function (l, filter) {
          return scope.selected(l, filter).length;
        },
        selected: function (l, filter) {
          if (l === undefined) {
            if (scope.election && scope.election.census && scope.election.census.voters) {
              l = scope.election.census.voters;
            } else {
              l = [];
            }
          }
          return _.filter(l, function (v) {
            return v.selected === true && (!filter || filter(v));
          });
        },
        shown: function(d) {
          if (scope.election && scope.election.census && scope.election.census.voters) {
            return scope.election.census.voters;
          }

          return [];
        }
      });

      function main() {
        scope.electionLoaded = true;
        scope.election = ElectionsApi.currentElection;
        MustExtraFieldsService(scope.election);
        if (scope.page === 1 && !newElection()) {
          // assign the election id that somehow is not assigned before
          scope.election.id = $stateParams.id;
          reloadCensus();
        }
      }

      ElectionsApi.waitForCurrent(main);
    }

    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avAdmin/admin-directives/elcensus/elcensus.html'
    };
  });
