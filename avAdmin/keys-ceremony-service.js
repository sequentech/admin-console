/**
 * This file is part of admin-console.
 * Copyright (C) 2022  Sequent Tech Inc <legal@sequentech.io>

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
 * Service to manage the keys ceremony modal steps.
 */
angular
.module('avAdmin')
.factory('KeysCeremony', function($q, $modal)
{
  var service = {
    ceremony: null,
    // reference to the election in which authentication messages are going
    // to be sent
    election: null,

    trusteesLogin: {
      /*
       * "trustee_id" : {
       *   "username": "username",
       *   "password": "password"
       * }
       */
    },

    steps: [],
  };

  /**
   * Sets the election related to this service
   */
  service.setElection = function(el)
  {
    service.election = el;
  };

  function launchKeyDistributionInitialModal(numSteps) {
    return $modal
    .open({
      templateUrl: "avAdmin/admin-directives/dashboard/key-distribution-ceremony-modal.html",
      controller: "KeyDistributionCeremonyModal",
      size: 'lg',
      resolve: {
        dialogName: function () { return 'launchKeyDistributionCeremony'; },
        data: function() 
        {
          return {
            election: service.election,
            numSteps: numSteps,
          };
        }
      }
    }).result;
  }

  function launchTrusteeLoginModal(trusteeId, numSteps, currentStep) {
    return $modal
    .open({
      templateUrl: "avAdmin/admin-directives/dashboard/login-trustee-ceremony-modal.html",
      controller: "LoginTrusteeCeremonyModal",
      size: 'lg',
      resolve: {
        dialogName: function () { return 'loginTrusteeCeremony'; },
        data: function() 
        {
          return {
            election: service.election,
            trusteeId: trusteeId,
            numSteps: numSteps,
            currentStep: currentStep
          };
        }
      }
    }).result;
  }

  function launchDownloadShareModal(trusteeId, numSteps, currentStep) {
    return $modal
    .open({
      templateUrl: "avAdmin/admin-directives/dashboard/download-share-ceremony-modal.html",
      controller: "DownloadShareCeremonyModal",
      size: 'lg',
      resolve: {
        dialogName: function () { return 'downloadShareCeremony'; },
        data: function() 
        {
          return {
            election: service.election,
            trusteeId: trusteeId,
            username: service.trusteesLogin[trusteeId].username,
            password: service.trusteesLogin[trusteeId].password,
            numSteps: numSteps,
            currentStep: currentStep
          };
        }
      }
    }).result;
  }

  function launchCheckShareModal(trusteeId, numSteps, currentStep) {
    return $modal
    .open({
      templateUrl: "avAdmin/admin-directives/dashboard/check-share-ceremony-modal.html",
      controller: "CheckShareCeremonyModal",
      size: 'lg',
      resolve: {
        dialogName: function () { return 'checkShareCeremony'; },
        data: function() 
        {
          return {
            election: service.election,
            trusteeId: trusteeId,
            username: service.trusteesLogin[trusteeId].username,
            password: service.trusteesLogin[trusteeId].password,
            numSteps: numSteps,
            currentStep: currentStep
          };
        }
      }
    }).result;
  }

  function launchDeleteShareModal(trusteeId, numSteps, currentStep) {
    return $modal
    .open({
      templateUrl: "avAdmin/admin-directives/dashboard/delete-share-ceremony-modal.html",
      controller: "DeleteShareCeremonyModal",
      size: 'lg',
      resolve: {
        dialogName: function () { return 'deleteShareCeremony'; },
        data: function() 
        {
          return {
            election: service.election,
            trusteeId: trusteeId,
            username: service.trusteesLogin[trusteeId].username,
            password: service.trusteesLogin[trusteeId].password,
            numSteps: numSteps,
            currentStep: currentStep,
            privateKeyShareFile: service.trusteesPrivateKeyShareFile[trusteeId]
          };
        }
      }
    }).result;
  }

  function launchRestoreShareModal(trusteeId) {
    return $modal
    .open({
      templateUrl: "avAdmin/admin-directives/dashboard/restore-share-ceremony-modal.html",
      controller: "RestoreShareCeremonyModal",
      size: 'lg',
      resolve: {
        dialogName: function () { return 'restoreShareCeremony'; },
        data: function() 
        {
          return {
            election: service.election,
            trusteeId: trusteeId,
            username: service.trusteesLogin[trusteeId].username,
            password: service.trusteesLogin[trusteeId].password
          };
        }
      }
    }).result;
  }

  function PromiseResolve(value) {
    var deferred = $q.defer();
    var promise = deferred.promise;
    deferred.resolve(value);

    return promise;
  }

  service.launchKeyDistributionCeremony = function (election) {
    service.setElection(election);
    service.ceremony = 'keys-distribution';
    var authorities = election.auths.filter(function (trustee) {
      return undefined === election.trusteeKeysState.find(function (el){ return el.id === trustee && el.state === "deleted"; });
    });
    var numSteps = 1 + 4 * authorities.length;

    return launchKeyDistributionInitialModal(numSteps)
    .then(function (result) {

      var methodsArray = authorities.map(function (trusteeId, index) {
        return function () {
          return launchTrusteeLoginModal(trusteeId, numSteps, 2 + 4 * index)
          .then(function (res) {
            service.trusteesLogin[trusteeId] = res;
            return launchDownloadShareModal(trusteeId, numSteps, 3 + 4 * index);
          })
          .then(function (res) {
            return launchCheckShareModal(trusteeId, numSteps, 4 + 4 * index);
          })
          .then(function (res) {
            service.trusteesPrivateKeyShareFile[trusteeId] = res;
            return launchDeleteShareModal(trusteeId, numSteps, 4 + 4 * index);
          });
        };
      });

      return methodsArray.reduce(function (prev, cur) { return prev.then(cur); }, PromiseResolve());
    });
  };

  service.launchOpeningCeremony = function (election) {
    service.setElection(election);
    service.ceremony = 'opening';

    $modal
    .open({
      templateUrl: "avAdmin/admin-directives/dashboard/opening-ceremony-modal.html",
      controller: "OpeningCeremonyModal",
      size: 'lg',
      resolve: {
        dialogName: function () { return 'launchOpeningCeremony'; },
        data: function() 
        {
          return {
            election: service.election,
          };
        }
      }
    });
  };

  return service;
});