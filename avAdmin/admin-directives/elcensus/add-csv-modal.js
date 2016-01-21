angular.module('avAdmin')
  .controller('AddCsvModal',
    function($scope, $modalInstance, election, ConfigService) {
      $scope.election = election;
      $scope.textarea = "";
      $scope.helpurl = ConfigService.helpUrl;
      $scope.ok = function () {
        $modalInstance.close($("#csv-textarea").val());
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    });
