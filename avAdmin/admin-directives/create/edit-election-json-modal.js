angular.module('avAdmin')
  .controller('EditElectionJsonModal',
    function($scope, $modalInstance, electionJson)
    {
      $scope.electionJson = {
        model: electionJson
      };
      $scope.ok = function () {
        $modalInstance.close({electionJson: $scope.electionJson.model});
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
