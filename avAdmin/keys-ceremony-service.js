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
       * "trustee_id": {
       *   "username": "username",
       *   "password": "password"
       * }
       */
    },
    trusteesPrivateKeyShareFile: {
      /*
       * "trustee_id": File,
       */
    },

    /** step methods:
     *   - key-distribution
     *   - login
     *   - download-share
     *   - secure-share
     *   - check-share
     *   - delete-share
     *   - restore-share
     */ 

    /**
     * steps format:
     * steps = [
     *  {
     *    stepMethod: 'key-distribution',
     *    trusteeId: null,
     *  }
     * ]
     */

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

  function launchSecureShareModal(trusteeId, numSteps, currentStep) {
    return $modal
    .open({
      templateUrl: "avAdmin/admin-directives/dashboard/secure-share-ceremony-modal.html",
      controller: "SecureShareCeremonyModal",
      size: 'lg',
      resolve: {
        dialogName: function () { return 'secureShareCeremony'; },
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

  function launchSteps(index) {
    var step = service.steps[index];
    var numSteps = service.steps.length;
    
    if (!step) {
      return PromiseResolve();
    }

    switch (step.stepMethod) {
      case 'key-distribution':
        return launchKeyDistributionInitialModal(numSteps)
          .then(function(_result) { return launchSteps(index + 1); });
      case 'login':
        return launchTrusteeLoginModal(step.trusteeId, numSteps, index + 1)
          .then(function (res) {
            service.trusteesLogin[step.trusteeId] = res;
            return launchSteps(index + 1);
          });
      case 'download-share':
        return launchDownloadShareModal(step.trusteeId, numSteps, index + 1)
          .then(function (res) {
            return launchSteps(index + 1);
          });
      case 'secure-share':
        return launchSecureShareModal(step.trusteeId, numSteps, index + 1)
          .then(function (res) {
            return launchSteps(index + 1);
          });
      case 'check-share':
        return launchCheckShareModal(step.trusteeId, numSteps, index + 1)
          .then(function (res) {
            service.trusteesPrivateKeyShareFile[step.trusteeId] = res;
            return launchSteps(index + 1);
          });
      case 'delete-share':
        return launchDeleteShareModal(step.trusteeId, numSteps, index + 1)
          .then(function (res) {
            return launchSteps(index + 1);
          });
      case 'restore-share':
        return launchRestoreShareModal(step.trusteeId, numSteps, index + 1)
          .then(function (res) {
            return launchSteps(index + 1);
          });
      default:
        return PromiseResolve();
    }
  }

  service.launchKeyDistributionCeremony = function (election) {
    service.setElection(election);
    service.ceremony = 'keys-distribution';

    /** step methods:
     *   - key-distribution
     *   - login
     *   - download-share
     *   - secure-share
     *   - check-share
     *   - delete-share
     *   - restore-share
     */ 


    service.steps = [
      {
        stepMethod: 'key-distribution',
        trusteeId: null,
      }
    ];

    var authorities = election.auths.filter(function (trustee) {
      return undefined === election.trusteeKeysState.find(function (el){ return el.id === trustee && el.state === "deleted"; });
    });

    var authSteps = authorities.map(function (trusteeId) {
      return [
        {
          stepMethod: 'login',
          trusteeId: trusteeId,
        },
        {
          stepMethod: 'download-share',
          trusteeId: trusteeId,
        },
        {
          stepMethod: 'secure-share',
          trusteeId: trusteeId,
        },
        {
          stepMethod: 'check-share',
          trusteeId: trusteeId,
        },
        {
          stepMethod: 'delete-share',
          trusteeId: trusteeId,
        },
      ];
    }).flat();

    service.steps = service.steps.concat(authSteps);

    return launchSteps(0);
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