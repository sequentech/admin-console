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

// Form to register a ballot box tally sheet
angular.module('avAdmin')
  .controller(
    'WriteTallySheetModal',
    function(
      $scope,
      $modalInstance,
      ElectionsApi,
      ballotBox,
      Authmethod
    ) {
      $scope.tallySheet = {
        id: ElectionsApi.currentElection.id,
        title: ElectionsApi.currentElection.title,

        registeredVotes: 0,
        observations: "",
        totals: {
          total_count: 0
        },

        questions: _.map(
          ElectionsApi.currentElection.questions,
          function (question)
          {
            return {
              title: question.title,
              totals: {
                blank_votes: 0,
                null_votes: 0,
              },
              answers: _.map(
                question.answers,
                function (answer)
                {
                  return {
                    id: answer.id,
                    text: answer.text,
                    total_count: 0
                  };
                }
              )
            };
          }
        )
      };
      $scope.ballotBox = ballotBox;
      $scope.deleteText = {text: ""};
      $scope.numbersError = false;


      // used inside checkNumbers() to validate a tally sheet number
      function checkNumber(i)
      {
        if (!angular.isNumber(i) || i < 0)
        {
          throw "Invalid";
        }
      }

      // throws an exception if expr is false
      function assert(expr)
      {
        if (!expr) {
          throw "Invalid";
        }
      }

      // Checks if all numbers are valid (>=0) and add up
      $scope.checkNumbers = function()
      {
        $scope.numbersError = false;
        try {
          checkNumber($scope.tallySheet.totals.total_count);
          _.each(
            $scope.tallySheet.questions,
            function(question) {
              checkNumber(question.totals.blank_votes);
              checkNumber(question.totals.null_votes);
              assert(
                $scope.tallySheet.totals.total_count === (
                  question.totals.blank_votes +
                  question.totals.null_votes +
                  _.map(
                    question.answers,
                    function (answer)
                    {
                      checkNumber(answer.total_count);
                      return answer.total_count;
                    }
                  )
                )
              );
            }
          );
        } catch(e) {
          $scope.numbersError = true;
        }
      };

      $scope.ok = function ()
      {
        $modalInstance.close($scope.tallySheet);
      };

      $scope.cancel = function ()
      {
        $modalInstance.dismiss('cancel');
      };
    }
  );
