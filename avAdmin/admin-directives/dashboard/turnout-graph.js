/**
 * This file is part of admin-console.
 * Copyright (C) 2022 Sequent Tech Inc <legal@sequentech.io>

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
  .directive('avTurnoutGraph',
    function(
      $q,
      $window,
      $state,
      Authmethod,
      Plugins,
      ElectionsApi,
      $stateParams,
      $timeout
    ) {
      function link(scope, element, attrs) {
        function generateTimeSeries(minDate, maxDate, hours) {
          let series = [];
          let current = minDate;

          while (current < maxDate) {
            series.push(current);
            current = new Date(current);
            current.setHours(current.getHours() + hours);
          }

          return series;
        }

        function generateLabels(timeSeries) {
          var shorten = timeSeries.length > 14;

          return timeSeries.map(function (dateValue) {
            if (shorten && 0 !== dateValue.getHours()) {
              return '';
            } else {
              return dateValue.toLocaleString(
                undefined,
                {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  hour12: false,
                  minute:'2-digit'
                }
              );
            }
          });
        }

        // update variables used for graph
        // turnoutData has the same format as the response from fetching turnout
        // except that 'hour' is a Date and that the data includes the election title
        function calculateValues(turnoutData, minDate, maxDate) {
          var series = Object.values(turnoutData).map(function (electionData) {
            return electionData.title;
          });

          var timeSeries = generateTimeSeries(minDate, maxDate);
          var labels = generateLabels(timeSeries);

        }

        // download turnout data and calculate values
        function updateTurnoutData() {
          var turnoutData;
          // fetch turnout
          Authmethod.getTurnout(scope.id)
          .then(function (response){
            if (200 !== response.status) {
              console.log("Error fetching turnout: ");
              console.log(response);
              return;
            }

            turnoutData = response.data;
            var electionIds = Object.keys(response.data);
  
            // fetch iam's election data to gather election title
            return $q.all(electionIds.map(function (electionId) {
              return ElectionsApi.getElection(electionId);
            }));
          })
          .then(function (electionsData) {
            electionsData.map(function (el) {
              // the election id is a number here but a string key on the turnoutData object
              if (!turnoutData[String(el.id)]) {
                return;
              }
              // add title
              turnoutData[String(el.id)].title = el.title;

              // convert string dates to Date objects and find min/max
              var minDate = new Date();
              var maxDate = new Date(0);
              Object.values(turnoutData)
              .map(function (turnoutElection) {
                if (!turnoutElection.votes_per_hour) {
                  turnoutElection.votes_per_hour = [];
                  return;
                }
                turnoutElection.votes_per_hour = turnoutElection.votes_per_hour.map(function (data) {
                  data.hour = new Date(data.hour);
                  if (data.hour < minDate) {
                    minDate = data.hour;
                  }
                  if (data.hour > maxDate) {
                    maxDate = data.hour;
                  }
                  return data;
                });
              });
              if (maxDate < minDate) {
                maxDate = new Date();
              }
              calculateValues(turnoutData, minDate, maxDate);

            });
          });
        }
        var labels = ["January", "February", "March", "April", "May", "June", "July"];
        var series = ['Series A', 'Series B'];
        var data = [
          [65, 59, 80, 81, 56, 55, 40],
          [28, 48, 40, 19, 86, 27, 90]
        ];
        var onClick = function (points, evt) {
          console.log(points, evt);
        };
        
        // Simulate async data update
        $timeout(function () {
          scope.data = [
            [28, 48, 40, 19, 86, 27, 90],
            [65, 59, 80, 81, 56, 55, 40]
          ];
        }, 3000);
        angular.extend(scope, {
          labels: labels,
          series: series,
          data: data,
          onClick: onClick,
          updateTurnoutData: updateTurnoutData
        });

        scope.$watch('id', updateTurnoutData);
      }

      return {
        restrict: 'AE',
        scope: true,
        link: link,
        templateUrl: 'avAdmin/admin-directives/dashboard/turnout-graph.html'
      };
    });
  
