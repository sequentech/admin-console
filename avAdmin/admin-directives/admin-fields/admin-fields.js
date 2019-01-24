/**
 * Requires the user to edit some admin fields
 */
angular.module('agora-gui-admin')
  .directive(
    'avAdminFields',
    function(
      $i18next,
      NextButtonService,
      ElectionsApi)
    {
      function link(scope, element, attrs)
      {
          scope.goNext = NextButtonService.goNext;
          scope.election = ElectionsApi.currentElection;
      }

      return {
        restrict: 'AEC',
        scope: {},
        link: link,
        templateUrl: 'avAdmin/admin-directives/admin-fields/admin-fields.html'
      };
    }
  );

