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
        function truncateDate(date, scale /* hour|day|week|month */) {
          switch(scale.toLowerCase()) {
              case 'hour':
                  date.setMinutes(0);
                  date.setSeconds(0);
                  date.setMilliseconds(0);
                  break;
              case 'day':
                  date.setHours(0);
                  date.setMinutes(0);
                  date.setSeconds(0);
                  date.setMilliseconds(0);
                  break;
              case 'week':
                  const dayOfWeek = date.getDay();
                  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                  date.setDate(diff);
                  date.setHours(0);
                  date.setMinutes(0);
                  date.setSeconds(0);
                  date.setMilliseconds(0);
                  break;
              case 'month':
                  date.setDate(1);
                  date.setHours(0);
                  date.setMinutes(0);
                  date.setSeconds(0);
                  date.setMilliseconds(0);
                  break;
              default:
                  throw new Error('Invalid scale parameter. Use "hour", "day", "week", or "month".');
          }
          return date;
      }
      function advanceDate(date, scale /* hour|day|week|month */) {
        const newDate = new Date(date.getTime()); // Create a copy of the input date
        switch(scale.toLowerCase()) {
            case 'hour':
                newDate.setHours(date.getHours() + 1);
                break;
            case 'day':
                newDate.setDate(date.getDate() + 1);
                break;
            case 'week':
                newDate.setDate(date.getDate() + 7);
                break;
            case 'month':
                newDate.setMonth(date.getMonth() + 1);
                break;
            default:
                throw new Error('Invalid scale parameter. Use "hour", "day", "week", or "month".');
        }
        return newDate;
      }

      function generateTimeSeries(minDate, maxDate, scale /* hour|day|week|month */) {
        scale = scale.toLowerCase();
        minDate = truncateDate(truncateDate, scale);
        var series = [];
        var current = minDate;

        while (current <= maxDate) {
          series.push(current);
          current = advanceDate(current, scale);
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

        function generateSelectedSeries(series) {
          return series.map(function (_seriesElement, index) {
            return scope.selectedSeries && false === scope.selectedSeries[index] || true;
          });
        }


        function refreshGraph() {
          var series = [];
          var data = [];
          for (var i = 0; i < scope.selectedSeries.length; i++) {
            if (!scope.selectedSeries[i]) {
              continue;
            }
            series.push(scope.seriesBase[i]);
            data.push(scope.dataBase[i]);
          }
          scope.series = series;
          scope.data = data;
          scope.labels = scope.labelsBase;
        }

        // update variables used for graph
        // turnoutData has the same format as the response from fetching turnout
        // except that 'hour' is a Date and that the data includes the election title
        function calculateValues(turnoutData, minDate, maxDate) {
          var series = Object.values(turnoutData).map(function (electionData) {
            return electionData.title;
          });

          var timeSeries = generateTimeSeries(minDate, maxDate, 'hour');
          if (timeSeries.length >= 24*30*3) {
            timeSeries = generateTimeSeries(minDate, maxDate, 'month');
          } else if (timeSeries.length >= 24*7*3) {
            timeSeries = generateTimeSeries(minDate, maxDate, 'week');
          } else if (timeSeries.length >= 24*3) {
            timeSeries = generateTimeSeries(minDate, maxDate, 'day');
          }
          var labels = generateLabels(timeSeries);
          var selectedSeries = generateSelectedSeries(series);

          var data = Object.values(turnoutData).map(function (electionData) {
            if (timeSeries.length < 2) {
              return [electionData.votes_per_hour.reduce(
                function (accumulator, currentValue) {
                  return accumulator + currentValue.votes;
                },
                0
              )];
            }
            var electionDataIndex = 0;
            var timeSeriesIndex = 1;
            var dataElection = [];
            while (timeSeriesIndex <= timeSeries.length) {
              var acc = 0;
              while (electionDataIndex < electionData.votes_per_hour.length &&
                electionData.votes_per_hour[i].hour < timeSeries[timeSeriesIndex]) {
                  acc += electionData.votes_per_hour[i].votes;
                  electionDataIndex++;
              }
              dataElection.push(acc);
              timeSeriesIndex++;
            }
            return dataElection;
          });
          scope.dataBase = data;
          scope.labelsBase = labels;
          scope.seriesBase = series;
          scope.show = true;
          scope.selectedSeries = selectedSeries;
          refreshGraph();
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
            var minDate = new Date();
            var maxDate = new Date(0);
            electionsData.map(function (el) {
              // the election id is a number here but a string key on the turnoutData object
              if (!turnoutData[String(el.id)]) {
                return;
              }
              // add title
              turnoutData[String(el.id)].title = el.title;

              // add start/end dates
              if (el.startDate) {
                var startDate = new Date(el.startDate+"+00:00"); // expect GMT time
                if (startDate < minDate) {
                  minDate = startDate;
                }
              }
              if (el.endDate) {
                var endDate = new Date(el.endDate+"+00:00"); // expect GMT time
                if (endDate > maxDate) {
                  maxDate = endDate;
                }
              }
            });

            // convert string dates to Date objects and find min/max
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
        }
        var labels = ["January", "February"];
        var series = ['Series A'];
        var selectedSeries = [true];
        var data = [
          [0, 0],
        ];
        var options = {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      };
        var onClick = function (points, evt) {
          console.log(points, evt);
        };
        
        angular.extend(scope, {
          show: false,
          seriesBase: series,
          dataBase: data,
          labelsBase: labels,
          selectedSeries: selectedSeries,
          labels: labels,
          series: series,
          data: data,
          options: options,
          onClick: onClick,
          updateTurnoutData: updateTurnoutData
        });

        scope.$watch('id', updateTurnoutData);
        scope.$watch('selectedSeries', refreshGraph);
      }

      return {
        restrict: 'AE',
        scope: true,
        link: link,
        templateUrl: 'avAdmin/admin-directives/dashboard/turnout-graph.html'
      };
    });
  
