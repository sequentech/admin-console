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

      var names = ['email'];
      var must = null;

      if (_.contains(['email', 'email-otp'], el.census.auth_method)) {
        names = ['email'];
        must = [{
          "must": true,
          "name": "email",
          "type": "email",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        }];
      } else if (_.contains(['sms', 'sms-otp'], el.census.auth_method)) {
        names = ['tlf'];
        must = [{
          "must": true,
          "name": "tlf",
          "type": "tlf",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        }];
      } else if (el.census.auth_method === 'dnie') {
        names = ['dni'];
        must = [{
          "must": true,
          "name": "dni",
          "type": "text",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        }];
      } else if (el.census.auth_method === 'user-and-password') {
        names = ['username', 'password'];
        must = [{
          "must": true,
          "name": "username",
          "type": "text",
          "required": true,
          "min": 3,
          "max": 200,
          "required_on_authentication": true
        },
        {
          "must": true,
          "name": "password",
          "type": "password",
          "required": true,
          "min": 3,
          "max": 200,
          "required_on_authentication": true
        }];
      } else if (el.census.auth_method === 'email-and-password') {
        names = ['email', 'password'];
        must = [{
          "must": true,
          "name": "email",
          "type": "email",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        },
        {
          "must": true,
          "name": "password",
          "type": "password",
          "required": true,
          "min": 3,
          "max": 200,
          "required_on_authentication": true
        }];
      } else if (el.census.auth_method === 'openid-connect') {
        names = ['sub'];
        must = [{
          "must": true,
          "name": "sub",
          "type": "text",
          "required": true,
          "min": 1,
          "max": 255,
          "required_on_authentication": true
        }];
      }

      // the authmethod doesn't have a required field so we do nothing here
      if (must === null) {
        return;
      }

      var found = false;
      ef.forEach(function(e) {
        if (_.find(names, function(n) { return e.name === n; })) {
          found = true;
          e.must = true;
          if ('email' === e.name) {
            e.type = 'email';
          } else if ('tlf' === e.name) {
            e.type = 'tlf';
          } else if ('dni' === e.name) {
            e.type = 'text';
          } else if ('username' === e.name) {
            e.type = 'text';
          } else if ('password' === e.name) {
            e.type = 'password';
          } else if ('sub' === e.name) {
            e.type = 'text';
          }
        } else {
          e.must = false;
        }
      });

      if (!found) {
        _.each(must, function(m) { ef.push(m); });
      }
    };
  });
