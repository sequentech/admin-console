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
      'AdminProfile',
      function(
        $q,
        Plugins,
        Authmethod,
        ConfigService,
        $i18next,
        $http,
        $modal,
        $cookies,
        $rootScope)
      {
        var isModalOpened = false;
        var modalPromise;
        var adminprofile = {
          extra_fields: undefined,
          profile: undefined
        };

        function updateProfile() {
          var deferred = $q.defer();
          Authmethod.getUserInfoExtra()
            .success( function (d) {
              adminprofile.profile = angular.copy(d.metadata);
              deferred.resolve(adminprofile.profile);
            })
            .error(deferred.reject);
          return deferred.promise;
        }

        function getExtraFields() {
          var deferred = $q.defer();

          if (_.isUndefined(adminprofile.extra_fields)) {
            var autheventid = Authmethod.getAuthevent();
            Authmethod.viewEvent(autheventid)
              .success(function(data) {
                if (data.status === "ok") {
                  if (_.isObject(data.events) &&
                      _.isArray(data.events.extra_fields)) {
                   adminprofile.extra_fields = angular.copy(data.events.extra_fields);
                   deferred.resolve(adminprofile.extra_fields);
                  } else {
                    deferred.reject("error on data: " + data);
                  }
                } else {
                  deferred.reject(data.status);
                }
              })
              .error(deferred.reject);
          }
          else {
            // we already have the extra fields
            deferred.resolve(adminprofile.extra_fields);
          }
          return deferred.promise;
        }

        adminprofile.openProfileModal = function (check) {
          if (!!isModalOpened) {
            return modalPromise;
          }
          var deferred = $q.defer();
          check = !!check;
          updateProfile()
            .then(getExtraFields)
            .then(function (data) {
                var editable_fields = _.filter(
                  adminprofile.extra_fields,
                  function (item) {
                    return true === item.user_editable;
                  });
                var req_fields = _.filter(
                  adminprofile.extra_fields,
                  function (item) {
                    return (true === item.required_when_registered &&
                             (_.isUndefined(item.user_editable) ||
                             true === item.user_editable));
                  });
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

                  var open_modal = false;
                  if (check) {
                    for (var i = 0; i < req_fields.length; i++) {
                      if (!checkRequiredWhenRegisteredField(req_fields[i], adminprofile.profile)) {
                        open_modal = true;
                        break;
                      }
                    }
                  }
                  if (open_modal || !check) {
                    isModalOpened = true;
                    modalPromise = deferred.promise;
                    $modal.open({
                      templateUrl: "avAdmin/admin-profile/admin-profile.html",
                      controller: 'AdminProfileController',
                      size: 'lg',
                      resolve: {
                        fields_def: function () { return editable_fields; },
                        user_fields: function () { return adminprofile.profile; }
                      }
                    }).result.then(
                      function (value) {
                        isModalOpened = false;
                        deferred.resolve(value);
                        adminprofile.openProfileModal(check);
                      },
                      function (value) {
                        isModalOpened = false;
                        deferred.reject(value);
                        adminprofile.openProfileModal(check);
                      });
                  } else {
                    deferred.reject({});
                  }

            })
            .catch(deferred.reject);
          return deferred.promise;
        };

        adminprofile.getProfile = function () {
          var deferred = $q.defer();
          if (!_.isUndefined(adminprofile.profile)) {
            deferred.resolve(adminprofile.profile);
          } else {
            updateProfile()
              .then(deferred.resolve)
              .catch(deferred.reject);
          }
          return deferred.promise;
        };

        return adminprofile;
      });
