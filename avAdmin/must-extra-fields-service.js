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
  .factory('MustExtraFieldsService', function() {
    return function (el) {
      var ef = el.census.extra_fields;

      var name = 'email';
      var must = null;

      if (el.census.auth_method === 'email') {
        name = 'email';
        must = {
          "must": true,
          "name": "email",
          "type": "email",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        };
      } else if (el.census.auth_method === 'sms') {
        name = 'tlf';
        must = {
          "must": true,
          "name": "tlf",
          "type": "tlf",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        };
      } else if (el.census.auth_method === 'dnie') {
        name = 'dni';
        must = {
          "must": true,
          "name": "dni",
          "type": "text",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        };
      }

      // the authmethod doesn't have a required field so we do nothing here
      if (must === null) {
        return;
      }

      var found = false;
      ef.forEach(function(e) {
        if (e.name === name) {
          found = true;
          e.must = true;
          if ('email' === e.name) {
            e.type = 'email';
          } else if ('tlf' === e.name) {
            e.type = 'tlf';
          } else if ('dni' === e.name) {
            e.type = 'text';
          }
        } else {
          e.must = false;
        }
      });

      if (!found) {
        ef.push(must);
      }
    };
  });
