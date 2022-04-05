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
  .controller('ConfirmTallyActiveModal',
    function(
      $scope,
      $modalInstance,
      ConfigService,
      election,
      ElectionsApi
    ) {
      $scope.election = angular.copy(election);
      $scope.totalCensusCount = 0;
      $scope.totalCensusActiveCount = 0;
      $scope.election.census.voters = [];
      $scope.currentCount = 0; // start from zero as we use a different page size
      $scope.page = 1;
      $scope.downloading = false;
      $scope.finishedDownload = false;
      $scope.error = false;
      $scope.activeVoters = [];

      $scope.filterActiveVoters = function()
      {
        $scope.downloading = false;
        $scope.finishedDownload = true;
        $scope.activeVoters = _.filter(
          $scope.election.census.voters,
          function (voter)
          {
            return voter.metadata.active === true;
          }
        );
        $scope.totalCensusActiveCount = $scope.activeVoters.length;
      };

      $scope.loadMoreCensus = function ()
      {
        if ($scope.finishedDownload)
        {
          $scope.filterActiveVoters();
          return;
        }

        if ($scope.downloading)
        {
          return;
        }
        $scope.downloading = true;

        ElectionsApi.getCensus($scope.election, $scope.page, "max")
          .then(
            function(el)
            {
              $scope.page += 1;

              $scope.totalCensusCount = el.data.total_count;
              $scope.currentCount = el.data.end_index;
              if (el.data.end_index === el.data.total_count)
              {
                $scope.filterActiveVoters();
                return;
              }

              $scope.downloading = false;
              $scope.loadMoreCensus();
            }
          ).catch(
            function(data)
            {
              $scope.error = data;
              $scope.downloading = false;
            }
          );
      };


      $scope.helpurl = ConfigService.helpUrl;
      $scope.binding = {
        census_dump_mode: 'all'
      };

      $scope.ok = function ()
      {
        $modalInstance.close(
          _.map(
            $scope.activeVoters,
            function (voter)
            {
              return voter.username;
            }
          )
        );
      };

      $scope.cancel = function ()
      {
        $modalInstance.dismiss('cancel');
      };

      // auto launch load more
      $scope.loadMoreCensus();
    });
