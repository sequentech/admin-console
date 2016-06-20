/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2015-2016  Agora Voting SL <agora@agoravoting.com>

 * agora-gui-admin is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * agora-gui-admin  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with agora-gui-admin.  If not, see <http://www.gnu.org/licenses/>.
**/

angular.module('avAdmin')
  .directive('avQuestionOptionDetails', function($state, ElectionsApi) {
    function link(scope, element, attrs) {
        scope.editting = false;
        if (scope.answer.urls.length !== 2) {
          scope.answer.urls = [
            {title: "URL", url: ""},
            {title: "Image URL", url: ""}
          ];
        }

        scope.answerBeingEdited = function() {
          return scope.internal.editingIndex === scope.answer.id;
        };

        scope.setEdit = function(edit, event) {
          if (edit === true) {
            scope.internal.editingIndex = scope.answer.id;
          } else {
            scope.internal.editingIndex = -1;
          }

          if (!!event) {
            event.preventDefault();
          }
        };
    }

    return {
      restrict: 'AE',
      scope: true,
      link: link,
      templateUrl: 'avAdmin/admin-directives/question-option-details/question-option-details.html'
    };
  });
