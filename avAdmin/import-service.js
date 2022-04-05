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

angular.module('avAdmin')
  .factory('ImportService', function(moment, ElectionsApi) {
      var headers = {
        timestamp: "timestamp",
        org: "organization",
        admin: "admin_name",
        email: "admin_email",
        phone: "admin_phone_number",
        title: "title",
        desc: "description",
        start: "start",
        end: "end",
        auth: "authentication_method",
        census: "type_census",
        voters: "census",
        winners: "number_of_winner",
        min: "min_number_of_options",
        tally_type: "voting_system",
        max: "max_number_of_options",
        opts: "options",
        random: "random_order",
        results: "results",
        moreq: "more_questions",
        subject: "subject_email",
        msg: "body_email"
      };

      var headers1 = {};
      _.forEach(headers, function(v, k) { headers1[v] = k; });

      function getIndex(indexes, value) {
        return indexes.indexOf(headers[value]);
      }

      function parsedDate(d) {
        var fmt = "M/D/YYYY HH:mm:SS";
        var m = moment(d, fmt);

        // Hack to avoid election orchestra error
        var date = m.toJSON().slice(0, 19);
        date += '.001';

        return date;
      }

      function rawToEl(rawel) {
        if (!rawel.desc) {
          return null;
        }

        var el = ElectionsApi.templateEl();

        el.title = rawel['title'];
        el.description = rawel['desc'];
        el.start_date = parsedDate(rawel['start']);
        el.end_date = parsedDate(rawel['end']);
        el.census.census = rawel['census'].toLowerCase();
        if (!!rawel['subject']) {
          el.census.config.subject = rawel['subject'];
        }
        if (!!rawel['msg']) {
          el.census.config.msg = rawel['msg'];
        }
        var auth = rawel['auth'].toLowerCase();
        if (auth.indexOf("sms") !== -1) {
          el.census.auth_method = 'sms';
        } else {
          el.census.auth_method = 'email';
        }

        rawel['voters'].forEach(function(x) {
          var voter = {};
          if (auth === "sms") {
            voter['tlf'] = x.trim();
          } else {
            voter['email'] = x.trim();
          }
          el.census.voters.push({
            selected: false,
            vote: false,
            username: "",
            metadata: voter});
        });

        rawel['questions'].forEach(function(x) {
          var q = ElectionsApi.templateQ("");
          q.title = x.title;
          q.description = x.desc;
          q.max = parseInt(x.max, 10);
          q.min = parseInt(x.min, 10);
          q.num_winners = parseInt(x.winners, 10);
          q.tally_type = x.tally_type.toLowerCase();
          q.extra_options = {
            "shuffle_categories": x.random,
            "shuffle_all_options": x.random,
            "shuffle_category_list": [],
            "show_points": false
          };
          //q.answer_total_votes_percentage = x.results;
          x.opts.forEach(function(y, i) {
            var a = {
              category: "",
              details: "",
              id: i,
              sort_order: i,
              text: y,
              urls: []
            };
            q.answers.push(a);
          });

          el.questions.push(q);
        });
        return el;
      }

      function parseElection(cvs, indexes) {
        var rawEl = {questions: []};

        var q = {};
        var questions = false;
        var filter = function(x) { return x; };
        for(var i=0; i<cvs.length; i++) {
          var h = headers1[indexes[i]];
          var v = cvs[i];

          if (!questions) {
            rawEl[h] = v;
            if (h === "voters") {
              rawEl[h] = v.split("\n");
              rawEl[h] = _.filter(rawEl[h], filter);
            }
            if (h === "voters") {
              questions = true;
            }
          } else {
            if (h === "moreq") {
              if (q.title) {
                rawEl.questions.push(q);
              }
              q = {};
              if (v.toLowerCase().indexOf("no") >= 0) {
                break;
              }
            } else {
              q[h] = v;
              if (h === "opts") {
                q[h] = v.split("\n");
                q[h] = _.filter(q[h], filter);
              }
              if (h === "random") {
                q[h] = v.toLowerCase().indexOf("no") < 0;
              }
            }
          }
        }

        return rawToEl(rawEl);
      }

      function parseElections(cvs) {
        var indexes = cvs[0];
        var els = [];
        for (var i=1; i<cvs.length; i++) {
          var el = parseElection(cvs[i], indexes);
          if (el) {
            els.push(el);
          }
        }

        return els;
      }

      return parseElections;
    });
