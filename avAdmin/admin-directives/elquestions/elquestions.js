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
  .directive(
    'avAdminElquestions',
    function($i18next, $state, ElectionsApi, ElectionLimits)
    {
      // we use it as something similar to a controller here
      function link(scope, element, attrs) {
        scope.election = ElectionsApi.currentElection;
        scope.electionLimits = ElectionLimits;
        scope.vsystems = ['plurality-at-large', 'borda-nauru', 'borda', 'pairwise-beta', 'desborda'];
        scope.lshuffleoptions = ['dont-shuffle','shuffle-all', 'shuffle-some'];

        scope.electionEditable = function() {
          return !scope.election.id || scope.election.status === "registered";
        };

        function save() {
            $state.go("admin.auth");
        }

        function newQuestion() {
            var el = ElectionsApi.currentElection;
            if (!el.questions) {
                el.questions = [];
            }
            // New question
            var q = ElectionsApi.templateQ($i18next("avAdmin.questions.new") + " " + el.questions.length);
            el.questions.push(q);
            expandQuestion(el.questions.length - 1);
        }

        function delQuestion(index) {
          var qs = ElectionsApi.currentElection.questions;
          ElectionsApi.currentElection.questions = qs.slice(0, index).concat(qs.slice(index+1,qs.length));
        }

        function expandQuestion(index) {
          var qs = ElectionsApi.currentElection.questions;
          _.map(qs, function(q) { q.active = false; });
          qs[index].active = true;
        }

        function collapseQuestion(index) {
          var qs = ElectionsApi.currentElection.questions;
          _.map(qs, function(q) { q.active = false; });
        }

        function toggleQuestion(index) {
          var qs = ElectionsApi.currentElection.questions;
          var q = qs[index];
          var active = q.active;
          _.map(qs, function(q) { q.active = false; });
          if (!active) {
            q.active = true;
          }
        }

        function reorderOptions(index) {
            var el = ElectionsApi.currentElection;
            var qs = el.questions;
            qs[index].answers.forEach(function(an, idx) {
                an.id = idx;
                an.sort_order = idx;
            });
        }

        function addOption(index) {
            var el = ElectionsApi.currentElection;
            var qs = el.questions;
            var text = document.querySelector("#newopt").value;

            if (!text.trim()) {
                return;
            }

            if (!qs[index].answers) {
                qs[index].answers = [];
            }

            // new answer
            var a = {
                category: "",
                details: "",
                id: 0,
                sort_order: 0,
                text: text,
                urls: []
            };
            qs[index].answers.push(a);
            reorderOptions(index);
            document.querySelector("#newopt").value = "";
        }

        function delOption(i1, i2) {
            var el = ElectionsApi.currentElection;
            var qs = el.questions;
            var as = qs[i1].answers;
            qs[i1].answers = as.slice(0, i2).concat(as.slice(i2+1,as.length));
            reorderOptions(i1);
        }

        function incOpt(index, option, inc, event) {
            var el = ElectionsApi.currentElection;
            var qs = el.questions;
            var q = qs[index];

            if (!q[option]) {
                q[option] = 0;
            }
            q[option] = parseInt(q[option]) + inc;
            if (!!event) {
              event.preventDefault();
            }
        }

        // if there's only one question, just expand it, doesn't make sense to
        // show it collapsed
        if (scope.election.questions.length === 1) {
          expandQuestion(0);
        }

        // an election should surely always have at least one question, right?
        if (scope.electionEditable() && scope.election.questions.length === 0) {
          newQuestion();
        }

        angular.extend(scope, {
          saveQuestions: save,
          newQuestion: newQuestion,
          delQuestion: delQuestion,
          expandQuestion: expandQuestion,
          collapseQuestion: collapseQuestion,
          toggleQuestion: toggleQuestion,
          addOption: addOption,
          delOption: delOption,
          incOpt: incOpt,
        });
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-directives/elquestions/elquestions.html'
    };
  });
