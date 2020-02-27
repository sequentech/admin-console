angular.module('avAdmin')
  .controller('UseDraftModal',
    function($scope, $modalInstance, title)
    {
      $scope.title = title;

      $scope.ok = function () {
        $modalInstance.close('ok');
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
