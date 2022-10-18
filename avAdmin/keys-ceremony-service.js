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
.factory('KeysCeremony', function($q, $modal, Authmethod, Plugins)
{
  var service = {
    ceremony: null,
    // reference to the election in which authentication messages are going
    // to be sent
    election: null,

    steps: [],
  };

  /**
   * Sets the election related to this service
   */
  service.setElection = function(el)
  {
    service.election = el;
  };

  function launchKeyDistributionInitialModal() {
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
          };
        }
      }
    }).result;
  }

  function launchTrusteeLoginModal() {
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
          };
        }
      }
    }).result;
  }

  function launchDownloadShareModal() {
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
          };
        }
      }
    }).result;
  }

  function launchCheckShareModal() {
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
          };
        }
      }
    }).result;
  }

  function launchDeleteShareModal() {
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
          };
        }
      }
    }).result;
  }

  function PromiseResolve(value) {
    return new Promise(function(resolve) {
      resolve(value);
    });
  }

  service.launchKeyDistributionCeremony = function (election) {
    service.setElection(election);
    service.ceremony = 'keys-distribution';
    var authorities = election.auths.filter(function (trustee) {
      return -1 === election.trusteeKeysState.find(function (el){ return el.id === trustee && el.state === "deleted"; });
    });

    return launchKeyDistributionInitialModal()
    .then(function (result) {
      var methodsArray = authorities.map(function (trustee) {
        return launchTrusteeLoginModal(trustee.id)
          .then(function (res) {
            return launchDownloadShareModal();
          })
          .then(function (res) {
            return launchCheckShareModal();
          })
          .then(function (res) {
            return launchDeleteShareModal();
          });
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