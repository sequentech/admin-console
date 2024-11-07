angular.module('avAdmin')
  .controller('DeleteElectionsModal',
    function($scope, $modalInstance, electionIds)
    {
      $scope.electionIds = electionIds;

      $scope.ok = function () {
        $modalInstance.close('ok');
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
