 

angular.module('avAdmin')
  .directive(
    'avAdminField',
    function(
      $i18next,
      ElectionsApi) 
  {
    function link(scope, element, attrs) {
      scope.editable = function () {
        var election = ElectionsApi.currentElection;
        var editable = !election.id || election.status === "registered";
        return editable;
      };

      if ("int" === scope.field.type) {
        scope.value = { "val": scope.field.value };
        scope.$watch(
          'value.val',
          function (newVal, oldVal) {
            var parsed = parseInt(newVal);
            if (_.isNaN(parsed)) {
              parsed = newVal;
            }
            scope.field.value = parsed;
          });
      }
      
      scope.incInt = function (inc, event) {
        var val = parseInt(scope.value.val);
        var newValue = val + inc;
        if("int" === scope.field.type &&
           _.isNumber(val) &&
           (!scope.field.max || newValue <= scope.field.max) &&
           (!scope.field.min || newValue >= scope.field.min))
        {
          scope.value.val = newValue.toString();
        }
 
        if (!!event) {
          event.preventDefault();
        }
      };

      scope.validateMax = function (value) {
        var parsed = parseInt(value);
        return !_.isNumber(scope.field.max) || _.isNaN(parsed) || parsed <= scope.field.max;
      };

      scope.validateMin = function (value) {
        var parsed = parseInt(value);
        return !_.isNumber(scope.field.min) || _.isNaN(parsed) || parsed >= scope.field.min;
      };

      scope.validateNumber = function (value) {
        return !_.isNaN(parseInt(value));
      };
      
      scope.validateText = function (value) {
        if ("expected_census" === scope.field.name)
        {
          return true;
        }
        return false;
      };
    }

    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avAdmin/admin-directives/admin-field/admin-field.html'
    };
  }
);