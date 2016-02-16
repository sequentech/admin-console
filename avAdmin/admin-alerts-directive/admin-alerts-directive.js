angular.module('avAdmin')
  .directive('avAdminAlerts', function() {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
    }

    return {
      restrict: 'AE',
      link: link,
      templateUrl: 'avAdmin/admin-alerts-directive/admin-alerts-directive.html'
    };
  });
