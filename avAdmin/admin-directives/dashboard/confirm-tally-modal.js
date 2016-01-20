angular.module('avAdmin')
  .controller('ConfirmTallyModal',
    function($scope, $modalInstance, ConfigService) {
      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
