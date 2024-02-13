/**
 * This file is part of admin-console.
 * Copyright (C) 2015-2021  Sequent Tech Inc <legal@sequentech.io>

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

/* jshint ignore:start */

describe("Admin Controler tests", function () {

  beforeEach(module("avAdmin"));

  var $controller, $rootScope, $compile;

  beforeEach(inject(function(_$controller_, _$rootScope_, _$compile_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    $compile = _$compile_;
  }));

  describe("$scope.state", function() {
    it("Test admin controller", function () {
      var $scope = $rootScope.$new();
      var controller = $controller('AdminController', {
        $scope: $scope,
        $stateParams: { id: 1 },
        $filter: undefined,
        $cookies: undefined,
        ConfigService: { helpUrl: 'http://sequentech.io', showSuccessAction: true },
        AutomaticIds: undefined,
        ElectionsApi: {
          autoreloadStats: function() {},
          getElection: function() {
            return { then: function(fn) { fn({ id: 1 }); } };
          },
          setCurrent: function(el) {
            this.election = el;
          },
          getEditPerm: function() {
            return { then: function(fn) { fn({}); } };
          },
        },
        DraftElection: {
          getDraft: function() {
            return { then: function(fn) { fn({}); } };
          },
          updateDraft: function() {},
        },
        Plugins: {
          plugins: { list: [] },
          hook: function() {},
        },
        NextButtonService: {
          setStates: function() {},
        },
        $compile: $compile,
      });
      expect($scope.state).toBe('');
    });
  });
});
