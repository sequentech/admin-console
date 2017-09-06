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
  .directive('avAdminHead', function(Authmethod, $state, $cookies, $i18next, $modal, ConfigService, $sce) {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
        var autheventid = Authmethod.getAuthevent();
        var postfix = "_authevent_" + autheventid;
        var admin = $cookies["user" + postfix];
        scope.admin = admin;
        scope.organization = ConfigService.organization;
        scope.technology = ConfigService.technology;
        scope.nologin = ('nologin' in attrs) || scope.admin;
        scope.helpurl = ConfigService.helpUrl;
        scope.signupLink = ConfigService.signupLink;
        scope.helpList = _.map(ConfigService.helpList, function (item, index) {
          return $sce.trustAsHtml(item);
        });

        scope.loginrequired = ('loginrequired' in attrs);
        if (scope.loginrequired && !scope.admin) {
            $state.go("admin.logout");
        }

        function openProfileEditorModal(check) {
          check = !!check;
          var autheventid = Authmethod.getAuthevent();
          var req_fields = [];
          var editable_fields = [];

          Authmethod.viewEvent(autheventid)
            .success(function(data) {
              if (data.status === "ok") {
                editable_fields = _.filter(
                  data.events.extra_fields,
                  function (item) {
                    return true === item.user_editable;
                  });
                req_fields = _.filter(
                  data.events.extra_fields,
                  function (item) {
                    return (true === item.required_when_registered &&
                             (_.isUndefined(item.user_editable) ||
                             true === item.user_editable));
                  });
                Authmethod.getUserInfoExtra().success( function (d) {
                  function checkRequiredWhenRegisteredField(field, metadata) {
                    var ret = true;
                    var el = metadata[field.name];
                    if (_.isUndefined(el)) {
                      ret = false;
                    } else if (-1 !== 
                        ["text", "password", "regex", "email", "tlf", "textarea", 
                        "dni"].indexOf(field.type)) {
                      if (!_.isString(el) || 0 === el.length) {
                        ret = false;
                      } else if (_.isNumber(field.max) && el.length > field.max) {
                        ret = false;
                      } else if (_.isNumber(field.min) && el.length < field.min) {
                        ret = false;
                      }
                    } else if ("int" === field.type) {
                      if (!_.isNumber(el)) {
                        ret = false;
                      } else if (_.isNumber(field.max) && el > field.max) {
                        ret = false;
                      } else if (_.isNumber(field.min) && el < field.min) {
                        ret = false;
                      }
                    } else if ("bool" === field.type && !_.isBoolean(el)) {
                      ret = false;
                    }
                    return ret;
                  } // checkRequiredWhenRegisteredField

                  if (!_.isUndefined(d.metadata)) {
                    var open_modal = false;
                    if (check) {
                      for (var i = 0; i < req_fields.length; i++) {
                        if (!checkRequiredWhenRegisteredField(req_fields[i], d.metadata)) {
                          open_modal = true;
                          break;
                        }
                      }
                    }
                    if (open_modal || !check) {
                      $modal.open({
                        templateUrl: "avAdmin/admin-profile/admin-profile.html",
                        controller: 'AdminProfile',
                        size: 'lg',
                        resolve: {
                          fields_def: function () { return editable_fields; },
                          user_fields: function () { return d.metadata; }
                        }
                      });
                    }
                  }
                });
              }
            });
        }
        scope.openProfileEditorModal = openProfileEditorModal;
        openProfileEditorModal(true);
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-head-directive/admin-head-directive.html'
    };
  });
