/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2016  Agora Voting SL <agora@agoravoting.com>

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
    'avSocialNetworks', 
    ['ConfigService', 
    'ElectionsApi', 
    function(ConfigService, ElectionsApi) {
      function link(scope, element, attrs) {
        scope.socialNetList = [
          {
            name: 'Facebook',
            logo_url: '/admin/img/facebook_logo_50.png'
          },
          {
            name: 'Twitter',
            logo_url: '/admin/img/twitter_logo_48.png'
          }
        ];

        scope.election = ElectionsApi.currentElection;

        if(!scope.election.presentation.share_text) {
          scope.socialConfig = [];
        } else {
          scope.socialConfig = scope.election.presentation.share_text;
        }

        scope.newItem = function () {
            // New item
            var q = {
              network: 'Facebook',
              button_text: '',
              social_message: '',
              active: false
            };
            //ElectionsApi.templateQ($i18next("avAdmin.questions.new") + " " + el.questions.length);
            scope.socialConfig.push(q);
            expandItem(scope.socialConfig.length - 1);
        };

        scope.toggleItem = function(index) {
          var qs = scope.socialConfig;
          var q = qs[index];
          var active = q.active;
          _.map(qs, function(q) { q.active = false; });
          if (!active) {
            q.active = true;
          }
        };

        function expandItem(index) {
          var qs = scope.socialConfig;
          _.map(qs, function(q) { q.active = false; });
          qs[index].active = true;
        }

        scope.delItem = function(index) {
          var qs = scope.socialConfig;
          scope.socialConfig = qs.slice(0, index).concat(qs.slice(index+1,qs.length));
        };

        function electionEditable() {
          return !scope.election.id || scope.election.status === "registered";
        };

        scope.saveItems = function() {
          scope.election.presentation.share_text = angular.copy(scope.socialConfig);
          if(electionEditable()) {
            scope.successClose();
          } else {
            ElectionsApi.updateShare(scope.election, angular.copy(scope.socialConfig))
            .then(function() {
              scope.successClose();
            });
          }
        };
      }

      return {
        restrict: 'AE',
        link: link,
        templateUrl: 'avAdmin/admin-directives/social-networks/social-networks.html'
      };
  }]);