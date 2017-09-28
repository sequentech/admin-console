 

angular.module('avAdmin')
  .directive(
    'avNumberInput',
    function() 
  {
    function link(scope, element, attrs) {
      scope.$watch('$value', function (newValue, oldValue) {
        if (_.isString(newValue) && !isNaN(parseInt(newValue))) {
          scope.$evalAsync(function () {
            scope.$value = parseInt(newValue);
          });
        }
      });
    }

    return {
      restrict: 'AEC',
      scope: false,
      link: link
    };
  }
);