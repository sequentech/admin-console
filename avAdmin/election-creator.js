/**
 * This file is part of common-ui.
 * Copyright (C) 2022  Sequent Tech Inc <legal@sequentech.io>

 * common-ui is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * common-ui  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with common-ui.  If not, see <http://www.gnu.org/licenses/>.
**/


angular.module('avAdmin')
    .factory('ElectionCreator', function() {
        var service = {
        };

        service.generatingAuthevent = function (el) {
            // sanitize some unneeded values that might still be there. This
            // needs to be done because how we use ng-model
            if (el.census.config.subject && !_.contains(['email', 'email-otp'], el.census.auth_method)) {
              delete el.census.config.subject;
            }
            var authAction = el.census.config['authentication-action'];
            if (authAction.mode === 'vote') {
              authAction["mode-config"] = null;
            }

            var d = {
                auth_method: el.census.auth_method,
                has_ballot_boxes: el.census.has_ballot_boxes,
                support_otl_enabled: el.census.support_otl_enabled || false,
                census: el.census.census,
                auth_method_config: el.census.config,
                extra_fields: [],
                admin_fields: [],
                num_successful_logins_allowed: el.num_successful_logins_allowed,
                allow_public_census_query: el.allow_public_census_query,
                hide_default_login_lookup_field: el.hide_default_login_lookup_field,
                parent_id: null,
                children_election_info: null
            };

            // Set election id if existing in election configuration
            if (el.id) {
              d.id = el.id;
            }

            d.admin_fields = _.filter(el.census.admin_fields, function(af) {
              return true;
            });

            d.extra_fields = _.filter(el.census.extra_fields, function(ef) {
              var must = ef.must;
              delete ef.disabled;
              delete ef.must;

              // only add regex if it's filled and it's a text field
              if (!angular.isUndefined(ef.regex) &&
                (!_.contains(['int', 'text'], ef.type) || $.trim(ef.regex).length === 0)) {
                delete ef.regex;
              }

              if (_.contains(['bool', 'captcha'], ef.type)) {
                delete ef.min;
                delete ef.max;
              } else {
                if (!!ef.min) {
                  ef.min = parseInt(ef.min);
                }
                if (!!ef.max) {
                  ef.max = parseInt(ef.max);
                }
              }
              return true;
            });

            return d;
        };

        service.generatingElection = function (el) {
            console.log("registering election " + el.title);

            if (typeof el.extra_data === 'object') {
                el.extra_data = JSON.stringify(el.extra_data);
            }
            if (typeof el.tallyPipesConfig === 'object') {
            el.tallyPipesConfig = JSON.stringify(el.tallyPipesConfig);
            }
            if (typeof el.ballotBoxesResultsConfig === 'object') {
            el.ballotBoxesResultsConfig = JSON.stringify(el.ballotBoxesResultsConfig);
            }

            _.each(el.questions, function (q) {
              _.each(q.answers, function (answer) {
                answer.urls = _.filter(answer.urls, function(url) { return $.trim(url.url).length > 0;});
              });
            });

            return el;
        };
        
        return service;
    });
