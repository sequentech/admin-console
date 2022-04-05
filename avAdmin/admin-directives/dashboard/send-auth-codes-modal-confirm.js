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
      $scope.election = election;
      $scope.selected_auth_method = selected_auth_method;
      $scope.user_ids = user_ids;
      $scope.imsure = false;
      $scope.steps = SendMsg.steps;
      $scope.censusConfig = SendMsg.censusConfig;
      $scope.loading = false;
      $scope.numVoters = (!!SendMsg.user_ids) ? SendMsg.user_ids.length : $scope.election.auth.census;
      $scope.helpurl = ConfigService.helpUrl;

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

        return $i18next(
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
        var url2 = url + "/AABB1234";
        msg = msg.replace("__URL__", url);
        msg = msg.replace("__URL2__", url2);
        msg = msg.replace("__CODE__", "AABB1234");
        var keys = {
          "__URL__": url,
          "__URL2__": url2,
          "__CODE__": "AABB1234"
        };
        for (var i = 0; i < SendMsg.slug_list.length; i++) {
          keys["__" +  SendMsg.slug_list[i] + "__"] = "AABB1234";
        }
        return replacer(msg, keys);
      };

      /**
       * Check if message contains both __URL__ and __CODE__ as recommended
       */
      function isMsgComplete()
      {
        var re1 = /__URL__/;
        var re3 = /__URL2__/;
        var re2 = /__CODE__/;
        var msg = $scope.censusConfig.msg;

        return ((msg.match(re1) && msg.match(re2)) || msg.match(re3));
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
