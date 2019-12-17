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

/**
 * Service to manage the send authentication codes modal steps.
 */
angular.module('avAdmin')
  .factory('SendMsg', function($q, $modal, Authmethod, Plugins, ElectionsApi)
  {
    // These is the base data of this service
    var service = {
        // Flag that specifies if the edit dialog needs to be shown or not.
        // This allows us to start from the begining skipping that dialog.
        skipEditDialogFlag: true,
        scope: {},
        steps: {
            current: 1,
            base: 2,
            extra: 0,
            total: 2
        },

        // This dialog can be launched within the election census view, when
        // some users have been selected to be sent authentication codes. In
        // that case, this list will contain the list of those user ids.
        user_ids: null,

        // reference to the election in which authentication messages are going
        // to be sent
        election: null,

        // Extra data: this can be used by some plugins for send other datas
        extra: null
    };

    /**
     * Calculates the number of steps in this dialog
     */
    function calculateSteps()
    {
      service.steps.extra = 0;

      // This hooks gives plugins the opportuninty to do whatever they want
      // when the number of steps in this dialog is being calculated
      Plugins.hook(
        'send-auth-codes-steps',
        {el: service.election, ids: service.user_ids});

      service.steps.total = service.steps.base + service.steps.extra;
    }

    /**
     * Get the list of slug names for the extra fields
     */
    function get_slugs(election) {
      var slug_list = [];
        if (election.census.extra_fields && election.census.extra_fields.length > 0) {
           for (var i = 0; i < election.census.extra_fields.length; i++) {
             var field = election.census.extra_fields[i];
             if(field.slug && field.name) {
               slug_list.push(field.slug);
             }
           }
        }
      return slug_list;
    }

    /**
     * Sets the election related to this service, setting the edit dialog to be
     * shown.
     */
    service.setElection = function(el)
    {
        service.skipEditDialogFlag = false;
        service.election = el;
        service.slug_list = get_slugs(el);
    };

    /**
     * Launches the send messages service from the begining.
     */
    service.editAuthCodes = function()
    {
      service.skipEditDialogFlag = false;
      service.sendAuthCodesModal();
    };

    /**
     * Checks whether the extra_field of an election allows other auth methods.
     */
    service.authMethodIsSelectable = function () {

      function getExtraField(name) {
        for (var i = 0; i < service.election.census.extra_fields.length; i++) {
           if(service.election.census.extra_fields[i].type === name) {
            return service.election.census.extra_fields[i];
           }
        }
        return false;
      }

      if('sms' === service.election.census.auth_method || 'sms-otp' === service.election.census.auth_method) {
        var email_field = getExtraField('email');
        if(email_field && 'email' === email_field.type) {
          return true;
        }
      } else if('email' === service.election.census.auth_method) {
        var tlf_field = getExtraField('tlf');
        if(tlf_field && 'tlf' === tlf_field.type) {
          return true;
        }
      }
      return false;
    };

    /**
     * Triggers from the start the send messages dialog. The first dialog shown
     * is
     */
    service.sendAuthCodesModal = function() {
      var pluginData = {
        continue: true,
        el: service.election,
        ids: service.user_ids,
        extra: service.extra
      };
      Plugins.hook('send-auth-codes-modal', pluginData);
      if (!pluginData.continue) {
        return;
      }

      service.selectable_auth_method = service.authMethodIsSelectable();
      service.selected_auth_method = angular.copy(service.election.census.auth_method);
      // If skip dialog flag is activated, then we jump directly to the
      // confirmation step
      if (service.skipEditDialogFlag)
      {
        service.confirmAuthCodesModal();
        return;
      }

      // calculate the steps and specify that we are the first one
      calculateSteps();
      service.steps.current = 1;

      // show the initial edit dialog
      $modal.open({
        templateUrl: "avAdmin/admin-directives/dashboard/send-auth-codes-modal.html",
        controller: "SendAuthCodesModal",
        size: 'lg',
        resolve: {
          election: function () { return service.election; },
          user_ids: function() { return service.user_ids; },
          extra: function() { return service.extra; }
        }

      // when the edit dialog has been shown, then we default to not showing it
      // again unless necessary (setting the skip edit dialog to true) and
      // continue to the confirmation dialog
      }).result.then(function () {
        service.skipEditDialogFlag = true;
        service.confirmAuthCodesModal();
      });
    };

    /**
     * Shows the confirm dialog that allows the user to review the message to
     * be sent.
     *
     * It also contains some extension points, to allow plugins customize the
     * behaviour of the dialog quite extensibly.
     */
    service.confirmAuthCodesModal = function()
    {
      // This hook allows plugins to interrupt this function. This interruption
      // usually happens because the plugin does some processing and decides to
      // show another previous dialog at this step, for example.
      if (!Plugins.hook(
        'send-auth-codes-confirm',
        {el: service.election, ids: service.user_ids}))
      {
        return;
      }

      // Because plugins might have modified the number of previous steps, we
      // just know that this is the last step
      service.steps.current = service.steps.total;

      // Show the confirm dialog
      $modal.open({
        templateUrl: "avAdmin/admin-directives/dashboard/send-auth-codes-modal-confirm.html",
        controller: "SendAuthCodesModalConfirm",
        size: 'lg',
        resolve: {
          selected_auth_method: function() {
            return service.selected_auth_method;
          },
          election: function () { return service.election; },
          user_ids: function() { return service.user_ids; },
          exhtml: function () {
            var html = {html: [], scope: {}};
            Plugins.hook('send-auth-codes-confirm-extra', html);
            return html;
          }
        }

      // Function called when the modal closes to continue
      }).result.then(function (data)
      {
        // The returning value of the modal dialog is indicating here that the
        // user wants to edit the authentication message, so do it
        if (data === 'editAuthCodes')
        {
          service.editAuthCodes();
        }

        // hook to allow plugins process the closing of the modal dialog
        Plugins.hook('send-auth-codes-confirm-close', {data: data});
      });
    };

    /**
     * Promise to sends the authentication codes with the information stored in
     * the service.
     *
     * This function contains some hooks that alow plugins to modify its
     * behaviour.
     */
    service.sendAuthCodes = function()
    {
      var deferred = $q.defer();
      // TODO: decouple this service from the user interface
      var scope = service.scope;
      scope.loading = true;

      // This hook lets plugins decide if the function should really send auth
      // codes or not. A good reason not to would be that the plugin will do it
      // itself for example.
      if (Plugins.hook(
        'send-auth-codes-pre',
        {el: service.election, ids: service.user_ids}))
      {
          // send asynchronously the authentication codes
          Authmethod.sendAuthCodes(
            service.election.id,
            service.election,
            service.user_ids,
            service.selected_auth_method,
            service.extra
          ).success(function(r)
          {
            // if the sending is successful, show it
            scope.loading = false;
            scope.msg = "avAdmin.census.sentCodesSuccessfully";

            // Let plugins know about the success
            Plugins.hook(
              'send-auth-codes-success',
              {el: service.election, ids: service.user_ids, response: r});

            deferred.resolve(r);
          })
          .error(function(error)
          {
            // if there was an error, show it in the gui
            scope.loading = false;
            scope.error = error.error_codename || error.error || error;

            // and let plugins know
            Plugins.hook(
                'send-auth-codes-error',
                {
                  el: service.election,
                  ids: service.user_ids,
                  response: error
                });

            deferred.reject(error);
          });
      }
      return deferred.promise;
    };

    return service;
  });
