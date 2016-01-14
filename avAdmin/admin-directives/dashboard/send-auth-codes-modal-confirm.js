angular.module('avAdmin')
  .controller('SendAuthCodesModalConfirm',
    function(ConfigService, $location, $scope, $modalInstance, election, user_ids) {
      $scope.election = election;
      $scope.user_ids = user_ids;
      $scope.imsure = false;

      $scope.ok = function () {
        $modalInstance.close($scope.user_ids);
      };

      $scope.editAuthCodes = function () {
        $modalInstance.close("editAuthCodes");
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.exampleMsg = function() {
        var msg = election.census.config.msg;
        var url = "https://" + $location.host() + "/election/" + election.id + "/public/login";
        msg = msg.replace(/%\(url\)s/g, url);
        msg = msg.replace(/%\(code\)s/g, "AABB1234");
        return msg;
      };

      function isMsgComplete() {
        var re1 = /%\(url\)s/;
        var re2 = /%\(code\)s/;
        var msg = election.census.config.msg;

        return (msg.match(re1) && msg.match(re2));
      }

      if (isMsgComplete()) {
        $scope.imsure = true;
      }

      $scope.$watch(function () {
        // workarround because the ng-disabled doesn't work for me, I don't
        // know why
        if (isMsgComplete() || $("#imsure:checked").length) {
            $("#sendbutton").removeAttr("disabled");
        } else {
            $("#sendbutton").attr("disabled", "disabled");
        }
      });

      $scope.showCheckBox = function() {
        return !isMsgComplete();
      };
    });
