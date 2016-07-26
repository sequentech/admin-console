angular.module('avAdmin')
  .controller('EditElectionJsonModal',
    function($scope, $modalInstance, electionJson)
    {
      $scope.electionJson = electionJson;
      $scope.ok = function () {
        $modalInstance.close({electionJson: $scope.electionJson});
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
