angular.module('avAdmin')
  .directive('avAdminModal', function() {
    function link(scope, element, attrs) {
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-modal-directive/admin-modal-directive.html'
    };
  });
