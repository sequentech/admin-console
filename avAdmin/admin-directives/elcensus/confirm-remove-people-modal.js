angular.module('avAdmin')
  .controller('ConfirmRemovePeopleModal',
    function($scope, $modalInstance, election, numSelectedShown, ConfigService) {
      $scope.election = election;
      $scope.numSelectedShown = numSelectedShown;
      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
