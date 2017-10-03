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
  .directive('avAdminElauth', ['ElectionsApi', 'NextButtonService', 'Plugins', function(ElectionsApi, NextButtonService, Plugins) {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
        scope.election = ElectionsApi.currentElection;
        scope.auth = ['email','sms'];
        //scope.auth = ['email', 'sms', 'dnie'];
        scope.electionEditable = function() {
          return !scope.election.id || scope.election.status === "registered";
        };
        scope.goNext = NextButtonService.goNext;
        scope.$watch('election.census.auth_method', function (newVal, oldVal) {
          // check if any voter in the census has the 'email' or 'sms' defined
          function censusFilledAuthType(authType) {
            var ret = false;
            if (_.isArray(scope.election.census.voters) &&
                0 < scope.election.census.voters.length) {
              var index = 0;
              for (; index < scope.election.census.voters.length; index++) {
                var censusEl = scope.election.census.voters[index];
                if (_.isObject(censusEl.metadata) && 
                    _.isString(censusEl.metadata[authType]) &&
                    censusEl.metadata[authType].length > 0) {
                  ret = true;
                  break;
                }
              }
            }
            return ret;
          }
          // change census auth type from email to sms
          function toSMS() {
            if(censusFilledAuthType('email')) {
              _.each(scope.election.census.extra_fields,
               function (ef) {
                 if ("email" === ef.name) {
                   ef.type = "text";
                 }
               });
            } else {
              // remove the email extra field
              scope.election.census.extra_fields = 
                _.filter(
                  scope.election.census.extra_fields,
                  function (ef) {
                    return "email" !== ef.name;
                  });
              // no census data is lost if we remove the email field from 
              // voters, so we do that
              _.each(
                scope.election.census.voters, 
                function (voter) {
                  if (_.isObject(voter.metadata)) {
                    delete voter.metadata.email;
                  }
                });
            }
          }
          // change census auth type from sms to email
          function toEmail() {
            if(!censusFilledAuthType('tlf')) {
              // remove the tlf extra field
              scope.election.census.extra_fields = 
                _.filter(
                  scope.election.census.extra_fields,
                  function (ef) {
                    return "tlf" !== ef.name;
                  });
              // no census data is lost if we remove the tlf field from voters,
              // so we do that
              _.each(
                scope.election.census.voters, 
                function (voter) {
                  if (_.isObject(voter.metadata)) {
                    delete voter.metadata.tlf;
                  }
                });
            }
          }
          scope.$evalAsync(function () {
            if (newVal !== oldVal) {
              if ('email' === newVal) {
                toEmail();
              } else if ('sms' === newVal) {
                toSMS();
              }
            }
          });
        }, true);
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-directives/elauth/elauth.html'
    };
  }]);
