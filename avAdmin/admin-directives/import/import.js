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
  .directive('avAdminImport', function($window, ElectionsApi, $state, ImportService, $upload) {
    // we use it as something similar to a controller here
    function link(scope, element, attrs) {
        scope.loading = false;
        scope.filesDrop = null;
        scope.parsed = null;

        function selectFile() {
          document.querySelector("#importfile").click();
        }

        function retrieveFile(f) {
          console.log("retrieveFile");
          $window.Papa.parse(f, {
            complete: function(results) {
              console.log("retrieveFile complete");
              scope.loading = false;
              var els = ImportService(results.data);
              // only works for one election, the first                                                                                                                    
              ElectionsApi.currentElections = els;                                                                                                                         
              ElectionsApi.setCurrent(els[0]);                                                                                                                             
              ElectionsApi.newElection = true;                                                                                                                             
              $state.go("admin.create"); 
            },
          });
        }

        function uploadFile(element) {
          scope.loading = true;

          var f = element.files[0];
          scope.$apply(function() {
            scope.file = f;
          });
          retrieveFile(f);
        }

        scope.$watch('filesDrop', function () {
          console.log("watch filesDrop");
          if (!!scope.filesDrop && scope.filesDrop.length > 0) {
            console.log("watch filesDrop enter");
            retrieveFile(scope.filesDrop[0]);
          }
        });

        angular.extend(scope, {
          selectFile: selectFile,
          uploadFile: uploadFile
        });
    }

    return {
      restrict: 'AE',
      scope: {
      },
      link: link,
      templateUrl: 'avAdmin/admin-directives/import/import.html'
    };
  });
