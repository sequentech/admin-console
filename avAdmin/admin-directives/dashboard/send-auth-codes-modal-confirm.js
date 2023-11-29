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

/**
 * Confirm message sending modal dialog
 */
angular.module('avAdmin')
  .controller('SendAuthCodesModalConfirm',
    function(
      ConfigService,
      $location,
      $timeout,
      $scope,
      $modalInstance,
      $i18next,
      SendMsg,
      Plugins,
      election,
      user_ids,
      selected_auth_method,
      exhtml)
    {
      function calculateNumberOfRecipients() {
        if (!!SendMsg.user_ids) {
          return SendMsg.user_ids.length;
        } else {
          if ('voted' === SendMsg.filter) {
            return $scope.election.votes;
          } else if ('not_voted' === SendMsg.filter) {
            return $scope.election.auth.census - $scope.election.votes;
          } else {
            return $scope.election.auth.census;
          }
        }
      }
      $scope.election = election;
      $scope.selected_auth_method = selected_auth_method;
      $scope.user_ids = user_ids;
      $scope.imsure = false;
      $scope.steps = SendMsg.steps;
      $scope.censusConfig = SendMsg.censusConfig;
      $scope.loading = false;
      $scope.numVoters = calculateNumberOfRecipients();
      $scope.helpurl = ConfigService.helpUrl;
      $scope.allowHtmlEmails = ConfigService.allowHtmlEmails;
      $scope.showFilter = !user_ids;
      $scope.filterLabel = SendMsg.filter || 'none';

      $scope = _.extend($scope, exhtml.scope);
      $scope.exhtml = exhtml.html;

      // contact information
      $scope.contact = ConfigService.contact;

      /**
       * @returns the error, if any, when sending auth codes
       */
      $scope.error = function()
      {
        return SendMsg.scope.error;
      };

      /**
       * Translates an error returned by the server. This includes an extension
       * point so that plugins get a chances of managing custom error codes.
       */
      $scope.i18nSendError = function(error)
      {
        var hookData = {
          error: error,
          // return value from the hook:
          i18n: ''
        };
        Plugins.hook(
          'send-auth-codes-i18n-send-error',
          hookData
        );

        if (angular.isString(hookData.i18n) && hookData.i18n.length > 0)
        {
          return hookData.i18n;
        }

        var data = {
          tlf: $scope.contact.tlf,
          email: $scope.contact.email
        };

        return $i18next.t(
          "avAdmin.dashboard.modals.sendAuthCodes.confirmStep.unknownError",
          data);
      };

      /**
       * Accept and send the messages, then close the dialog if successful
       */
      $scope.ok = function ()
      {
        $scope.loading = true;
        SendMsg.sendAuthCodes()
          .finally(function()
          {
            $modalInstance.close($scope.user_ids);
          });
      };

      /**
       * Back to edit authentication codes
       */
      $scope.editAuthCodes = function ()
      {
        $modalInstance.close("editAuthCodes");
      };

      /**
       * Close the dialog
       */
      $scope.cancel = function ()
      {
        $modalInstance.dismiss('cancel');
      };

      /**
       * Render the example message with template substitution
       */
      $scope.parseMessage = function(msg)
      {
        function replacer(str, keys) {
          var out = str;
          Object.keys(keys).map(
            function (key) {
              var value = keys[key];
              out = out.replace(key, value);
            });
          return out;
        }

        var identity = "/aabb@gmail.com";
        if(_.contains(["sms", "sms-otp"], election.census.auth_method)) {
          identity = "/+34666666666";
        }
        var url = "https://" + $location.host() + "/election/" + election.id + "/public/login" + identity;
        var otl_url = "https://" + $location.host() + "/election/" + election.id + "/public/otl/13f5-456e-56f";
        var url2 = url + "/AABB1234";
        msg = msg.replace("__URL__", url);
        msg = msg.replace("__URL2__", url2);
        if (election.census.alternative_auth_methods) {
          _.each(
            election.census.alternative_auth_methods,
            function (alt_auth_method) {
              var key = "__URL_" + alt_auth_method.id.toUpperCase() + "__";
              var key2 = "__URL2_" + alt_auth_method.id.toUpperCase() + "__";
              var alt_url = "https://" + $location.host() + "/election/" + election.id + "/public/login-alt/" + alt_auth_method.id;
              var alt_url2 = "https://" + $location.host() + "/election/" + election.id + "/public/login-alt/?key=value" + alt_auth_method.id;
              msg = msg.replace(key, alt_url);
              msg = msg.replace(key2, alt_url2);
            }
          );
        }
        msg = msg.replace("__OTL__", otl_url);
        msg = msg.replace("__CODE__", "AABB1234");
        var keys = {
          "__URL__": url,
          "__URL2__": url2,
          "__OTL__": otl_url,
          "__CODE__": "AABB1234"
        };
        for (var i = 0; i < SendMsg.slug_list.length; i++) {
          keys["__" +  SendMsg.slug_list[i] + "__"] = "AABB1234";
        }
        return replacer(msg, keys);
      };

      /**
       * Check if message contains both __URL__ and __CODE__ as recommended, or
       * other valid combinations
       */
      function isMsgComplete()
      {
        var regexps = [
          [/__URL__/, /__CODE__/],
          [/__URL2__/],
          [/__OTL__/, /__CODE__/],
        ];
        var msg = $scope.censusConfig.msg;

        if (election.census.alternative_auth_methods) {
          _.each(
            election.census.alternative_auth_methods,
            function (alt_auth_method) {
              var key = "__URL_" + alt_auth_method.id.toUpperCase() + "__";
              var key2 = "__URL2_" + alt_auth_method.id.toUpperCase() + "__";
              regexps.push([new RegExp(key), /__CODE__/]);
              regexps.push([new RegExp(key2)]);
            }
          );
        }
        for (var i = 0; i < regexps.length; i++) {
          var match = true;
          for (var j = 0; j < regexps[i].length; j++) {
            match = match && msg.match(regexps[i][j]);
          }
          if (match) {
            return true;
          }
        }

        return false;
      }

      // set the default value of the flag that specifies that the user is sure
      // to send an auth message without __URL__ or __CODE__
      if (isMsgComplete())
      {
        $scope.imsure = true;
      }

      // only force user to check the imsure checkbox if the auth message
      // doesn't contain either __URL__ or __CODE__
      $scope.showCheckBox = function()
      {
        return !isMsgComplete();
      };

      // workarround because the ng-disabled doesn't work for me, I don't
      // know why
      $scope.$watch(function ()
      {
        if (!$scope.loading && (isMsgComplete() || $("#imsure:checked").length)) {
            $("#sendbutton").removeAttr("disabled");
        } else {
            $("#sendbutton").attr("disabled", "disabled");
        }
      });

      // use a click to an element with a specific class to close the dialog
      $timeout(function() {
        $(".av-plugin-modal-close").click(function()
        {
          var data = $(this).data("response");
          $modalInstance.close(data);
          return false;
        });
      }, 0);

    });
