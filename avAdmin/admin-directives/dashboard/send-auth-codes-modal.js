angular.module('avAdmin')
  .controller('SendAuthCodesModal',
    function($scope, $modalInstance, election, user_ids, ConfigService) {
      $scope.election = election;
      $scope.user_ids = user_ids;
      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close($scope.user_ids);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
