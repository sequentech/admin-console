angular.module('avAdmin')
  .controller('EditCalculateResultsJsonModal',
    function($scope, $modalInstance, payload)
    {
      $scope.calculateResultsJson = {
        model: payload
      };

      $scope.ok = function () {
        $modalInstance.close($scope.calculateResultsJson.model);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
