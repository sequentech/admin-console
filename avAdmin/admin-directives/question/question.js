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
  .directive('avAdminQuestion', function() {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
      scope.layouts = [
        "circles",
        "accordion",
        "simultaneous-questions"
        /*"conditional-accordion",
        "pcandidates-election"*/
      ];
      scope.edittingIndex = -1;
      scope.internal = {};
      scope.shuffle_opts_policy = 'shuffle-all';

      scope.questionIndex = function() {
        return scope.$index;
      };

      // validators
      scope.validateMaxNumOptions = function(value) {
        return parseInt(value) <= scope.q.answers.length;
      };

      scope.validateMinMax = function(value) {
        return parseInt(value) <= scope.q.max;
      };

      function scrollToCurrent() {
        setTimeout(function() {
          $("html,body").animate({scrollTop: $(element).offset().top - 250}, 400);
        }, 200);
      }

      // scroll and show on creation
      if (scope.q.active) {
        scrollToCurrent();
      }

      scope.$watch("q.active", function (newValue, oldValue) {
        if (newValue === true) {
          scrollToCurrent();
        }
      });

      // When an answer has been drag-and-drop, we have to update the indexes
      scope.recalculateAnswerIds = function(item, newPos) {
        // we do it a-posteriori, because the list has not been updated yet when
        // this call happens, but it will
        setTimeout(function() {
          _.each(scope.q.answers, function(answer, index) {
            answer.id = answer.sort_order = index;
          });
        }, 200);
        return item;
      };
    }

    return {
      restrict: 'AE',
      link: link,
      templateUrl: 'avAdmin/admin-directives/question/question.html'
    };
  });
