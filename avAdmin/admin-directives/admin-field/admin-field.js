 

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
      
      scope.incInt = function (inc, event) {
        var val = parseInt(scope.field.value);
        var newValue = val + inc;
        if("int" === scope.field.type &&
           _.isNumber(val) &&
           (!scope.field.max || newValue <= scope.field.max) &&
           (!scope.field.min || newValue >= scope.field.min))
        {
          scope.field.value = newValue.toString();
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
        return true;
      };

      scope.validateEmail = function (value) {
        var re = /^[^\s@]+@[^\s@.]+\.[^\s@.]+$/;
        return re.test(value);
      };

      scope.has_description = !_.isUndefined(scope.field.description) &&
        _.isString(scope.field.description) &&
        0 < scope.field.description.length;

      scope.getPlaceholder = function () {
        if (!_.isUndefined(scope.field.placeholder) &&
            _.isString(scope.field.placeholder)) {
          return "[placeholder]" + scope.field.placeholder;
        }
        return "";
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