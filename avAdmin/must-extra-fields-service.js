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
  .factory('MustExtraFieldsService', function() {
    return function (el) {
      var extra_fields = el.census.extra_fields;

      var mustFieldNames = ['email'];
      var mustFields = null;

      if (_.contains(['email', 'email-otp'], el.census.auth_method)) {
        mustFieldNames = ['email'];
        mustFields = [{
          "must": true,
          "name": "email",
          "type": "email",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        }];
      } else if (_.contains(['sms', 'sms-otp'], el.census.auth_method)) {
        mustFieldNames = ['tlf'];
        mustFields = [{
          "must": true,
          "name": "tlf",
          "type": "tlf",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        }];
      } else if (el.census.auth_method === 'dnie') {
        mustFieldNames = ['dni'];
        mustFields = [{
          "must": true,
          "name": "dni",
          "type": "text",
          "required": true,
          "min": 2,
          "max": 200,
          "required_on_authentication": true
        }];
      } else if (el.census.auth_method === 'user-and-password') {
        mustFieldNames = ['username', 'password'];
        mustFields = [{
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
        mustFieldNames = ['email', 'password'];
        mustFields = [{
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
        mustFieldNames = ['sub'];
        mustFields = [{
          "must": true,
          "name": "sub",
          "type": "text",
          "required": true,
          "min": 1,
          "max": 255,
          "required_on_authentication": true
        }];
      } else if (el.census.auth_method === 'smart-link') {
        mustFieldNames = ['user_id'];
        mustFields = [{
          "must": true,
          "name": "user_id",
          "type": "text",
          "required": true,
          "min": 1,
          "max": 255,
          "required_on_authentication": true
        }];
      }

      // the authmethod doesn't have any required field so we do nothing here
      if (mustFields === null) {
        return;
      }

      var foundNames = [];
      extra_fields.forEach(
        function(extra_field)
        {
          if (_.find(
            mustFieldNames, 
            function(fieldName) { return extra_field.name === fieldName; })
          ) {
            foundNames.push(extra_field.name);
            extra_field.must = true;
            if ('email' === extra_field.name) {
              extra_field.type = 'email';
            } else if ('tlf' === extra_field.name) {
              extra_field.type = 'tlf';
            } else if ('dni' === extra_field.name) {
              extra_field.type = 'text';
            } else if ('username' === extra_field.name) {
              extra_field.type = 'text';
            } else if ('password' === extra_field.name) {
              extra_field.type = 'password';
            } else if ('sub' === extra_field.name) {
              extra_field.type = 'text';
            }
          } else {
            extra_field.must = false;
          }
        }
      );

      // if any field is not found, add it
      if (foundNames.length !== mustFieldNames.length)
      {
        _.each(
          mustFields,
          function(mustField) {
            // if not found, add it
            if (!_.contains(foundNames, mustField.name))
            {
              extra_fields.push(mustField);
            }
          }
        );
      }
    };
  });
