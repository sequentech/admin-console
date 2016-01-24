angular.module('avAdmin')
  .factory('SendMsg', function($modal, Authmethod, AdminPlugins) {
    var service = {
        showEditAuthCode: false,
        scope: {},
        steps: {
            current: 1,
            base: 2,
            extra: 0,
            total: 2
        },
        user_ids: null,
        election: null
    };

    function getSteps() {
      service.steps.extra = 0;
      AdminPlugins.hook('send-auth-codes-steps', {el: service.election, ids: service.user_ids});
      service.steps.total = service.steps.base + service.steps.extra;
    }

    service.setElection = function(el) {
        service.showEditAuthCode = true;
        service.election = el;
    };

    service.editAuthCodes = function() {
      service.showEditAuthCode = true;
      service.sendAuthCodesModal();
    };

    service.sendAuthCodesModal = function() {
      if (!service.showEditAuthCode) {
          service.confirmAuthCodesModal();
          return;
      }

      getSteps();
      service.steps.current = 1;

      $modal.open({
        templateUrl: "avAdmin/admin-directives/dashboard/send-auth-codes-modal.html",
        controller: "SendAuthCodesModal",
        size: 'lg',
        resolve: {
          election: function () { return service.election; },
          user_ids: function() { return service.user_ids; }
        }
      }).result.then(function () {
          service.showEditAuthCode = false;
          service.confirmAuthCodesModal();
      });
    };

    service.confirmAuthCodesModal = function() {
      if (!AdminPlugins.hook('send-auth-codes-confirm', {el: service.election, ids: service.user_ids})) {
        return;
      }
      service.steps.current = service.steps.total;

      $modal.open({
        templateUrl: "avAdmin/admin-directives/dashboard/send-auth-codes-modal-confirm.html",
        controller: "SendAuthCodesModalConfirm",
        size: 'lg',
        resolve: {
          election: function () { return service.election; },
          user_ids: function() { return service.user_ids; },
          exhtml: function () {
            var html = {html: []};
            AdminPlugins.hook('send-auth-codes-confirm-extra', html);
            return html.html;
          }
        }
      }).result.then(function (data) {
        if (data === 'editAuthCodes') {
          service.editAuthCodes();
        } else {
          if (AdminPlugins.hook('send-auth-codes-confirm-close', {data: data})) {
            service.sendAuthCodes();
          }
        }
      });
    };

    service.sendAuthCodes = function() {
      var scope = service.scope;
      scope.loading = true;
      if (AdminPlugins.hook('send-auth-codes-pre', {el: service.election, ids: service.user_ids})) {
          Authmethod.sendAuthCodes(service.election.id, service.election, service.user_ids)
            .success(function(r) {
              scope.loading = false;
              scope.msg = "avAdmin.census.sentCodesSuccessfully";
              AdminPlugins.hook('send-auth-codes-success', {el: service.election, ids: service.user_ids, response: r});
            })
            .error(function(error) {
              scope.loading = false;
              scope.error = error.error;
              AdminPlugins.hook('send-auth-codes-error', {el: service.election, ids: service.user_ids, response: error});
            });
      }
    };

    return service;
  });
