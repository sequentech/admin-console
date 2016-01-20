angular.module('avAdmin')
  .controller('AddPersonModal',
    function($scope, $modalInstance, election, newcensus, ConfigService) {
      $scope.election = election;
      $scope.newcensus = newcensus;
      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
