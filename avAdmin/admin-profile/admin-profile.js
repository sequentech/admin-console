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
  .controller('AdminProfileController',
    function($scope, $modalInstance, ConfigService, $sce, Authmethod, fields_def, user_fields) {      
      var field;
      for (var i = 0; i < fields_def.length; i++) {
        field = fields_def[i];
        // adapt fields to have a label, to conform with admin-field directive
        if (_.isUndefined(field.label)) {
          field.label = field.name;
        }
        // give an initial value to fields
        if (_.isUndefined(user_fields[field.name])) {
          if (-1 !== ["text", "password", "regex", "email", "tlf", "textarea", 
              "dni"].indexOf(field.type)) {
           field.value = "";
          } else if ("int" === field.type) {
           field.value = 0;
          } else if ("bool" === field.type) {
           field.value = false;
          }
        } else {
          // copy the value from the profile
          field.value = angular.copy(user_fields[field.name]);
        }
      }

      $scope.fields_def = fields_def;
      $scope.user_fields = user_fields;
      $scope.showWorking = false;
      
      // true if some value has been changed and needs to be saved
      function values_changed() {
        var ret = false;
        var field;
        for (var i = 0; i < fields_def.length; i++) {
          field = fields_def[i];
          if (field.value !== user_fields[field.name]) {
            if ( false === ret) {
              ret = {};
              ret[field.name] = field.value;
            }
          }
        }
        return ret;
      }

      $scope.ok = function () {
        var changed = values_changed();
        if (false === changed) {
          $modalInstance.close();
        } else {
          $scope.showWorking = true;
          Authmethod.updateUserExtra(changed)
            .success(function (d) {
              $modalInstance.close(changed);
            })
            .error(function (e) {
              $modalInstance.close(changed);
            });
        }
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.html = $sce.trustAsHtml(ConfigService.profileHtml);
    });