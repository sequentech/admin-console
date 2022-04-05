/**
 * This file is part of admin-console.
 * Copyright (C) 2015-2016  Sequent Tech Inc <legal@sequentech.io>

 * admin-console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License.

 * admin-console  is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.

 * You should have received a copy of the GNU Affero General Public License
 * along with admin-console.  If not, see <http://www.gnu.org/licenses/>.
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
      Authmethod,
      tallySheet,
      election
    ) {
      $scope.step = 0;
      $scope.sending = false;
      $scope.mismatchTotalCount = false;

      $scope.goToStep = function(step) {
        if ($scope.step === 0 && step === 1) {
          $scope.sending = false;
        }
        $scope.step = step;
      };

      $scope.tallySheet = !!tallySheet && tallySheet.data || {
        id: election.id,
        title: election.title,

        registeredVotes: 0,
        observations: "",
        num_votes: 0,

        questions: _.map(
          election.questions,
          function (question)
          {
            return {
              title: question.title,
              blank_votes: 0,
              null_votes: 0,
              tally_type: question.tally_type,
              max: question.max,
              answers: _.map(
                question.answers,
                function (answer)
                {
                  return {
                    id: answer.id,
                    text: answer.text,
                    num_votes: 0
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
        if (!angular.isNumber(i) || i < 0 || (i ^ 0) !== i)
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
          checkNumber($scope.tallySheet.num_votes);
          $scope.mismatchTotalCount = (
            $scope.tallySheet.num_votes === $scope.tallySheet.registeredVotes
          );
          _.each(
            $scope.tallySheet.questions,
            function(question) {
              checkNumber(question.blank_votes);
              checkNumber(question.null_votes);
              assert(
                (
                  (
                    $scope.tallySheet.num_votes -
                    question.blank_votes -
                    question.null_votes
                  ) * (
                    question.max
                  )
                ) >= _.reduce(
                  question.answers,
                  function (sum, answer)
                  {
                    checkNumber(answer.num_votes);
                    return sum + answer.num_votes;
                  },
                  0
                )
              );
            }
          );
        } catch(e) {
          $scope.numbersError = true;
        }
      };

      $scope.sendTally = function ()
      {
        $scope.sending = true;
        var sheet = angular.copy($scope.tallySheet);
        delete sheet["registeredVotes"];
        delete sheet["id"];

        Authmethod
          .postTallySheet(
            election.id,
            ballotBox.id,
            $scope.tallySheet
          )
          .then(
            function onSuccess(response)
            {
              $scope.step = 2;
            },
            function onError(response) {
              $scope.error = response.data;
              $scope.sending = false;
            }
          );
      };

      $scope.close = function ()
      {
        $modalInstance.close();
      };

      $scope.cancel = function ()
      {
        $modalInstance.dismiss('cancel');
      };
    }
  );
