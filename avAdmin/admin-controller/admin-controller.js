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

angular.module('avAdmin').controller('AdminController',
  function(Plugins, ConfigService, $scope, $i18next, $state, $stateParams, ElectionsApi, DraftElection, $compile, NextButtonService, $q) {
    var id = $stateParams.id;
    $scope.state = $state.current.name;
    $scope.current = null;
    $scope.noplugin = true;
    $scope.helpurl = ConfigService.helpUrl;
    $scope.showSuccessAction = ConfigService.showSuccessAction;

    // state = admin.XXX
    $scope.shortst = $state.current.name.split(".")[1];

    // plugin stuff
    $scope.plugins = Plugins.plugins;
    Plugins.plugins.list.forEach(function(p) {
        if (p.directive) {
            var tpl = $compile( '<script type="text/ng-template" id="'+p.directive+'"><div class="av-plugin-'+p.directive+'"></div></script>' )($scope);
            if ($scope.shortst === p.name) {
                $scope.noplugin = false;
            }
        }
    });

    // removing autoreload stats
    ElectionsApi.autoreloadStats(null);

    function newElection() {
        var el = ElectionsApi.templateEl();
        $scope.current = el;
        ElectionsApi.setCurrent(el);
        ElectionsApi.newElection = true;
        return el;
    }

    $scope.hasAdminFields = false;
    var next_states = ['admin.dashboard'];

    function updateHasAdminFields() {
      $scope.hasAdminFields = false;
      if (_.isObject($scope.current) &&
          _.isObject($scope.current.census) &&
          _.isArray($scope.current.census.admin_fields) &&
          0 < $scope.current.census.admin_fields.length) {
        $scope.hasAdminFields = true;
      }
    }

    function updateStates() {
      updateHasAdminFields();
      if (!!$scope.hasAdminFields && -1 === next_states.indexOf('admin.adminFields')) {
        var index = next_states.indexOf('admin.basic') + 1;
        next_states.splice(index, 0, 'admin.adminFields');
      }
    }

    function loadDraft() {
      var deferred = $q.defer();
      DraftElection.getDraft()
        .then(function (el) {
            $scope.current = el;
            ElectionsApi.setCurrent(el);
            ElectionsApi.newElection = true;
            deferred.resolve(el);
          },
          deferred.reject);
      return deferred.promise;
    }

    if (id) {
        ElectionsApi.getElection(id)
            .then(function(el) {
                $scope.current = el;
                ElectionsApi.setCurrent(el);
                updateStates();
                NextButtonService.setStates(next_states);
                if ('real' in el) {
                    $scope.isTest = !el.real;
                } else {
                    $scope.isTest = true;
                }
            });
    }
    
    function goToBasic() {
      updateHasAdminFields();
      $state.go("admin.basic");
      $scope.isTest = !$scope.current['real'];
    }

    if ($scope.state === 'admin.new') {
        var draft = $stateParams.draft;
        if ('true' === draft) {
          // Load draft
          loadDraft()
            .then(goToBasic);
        } else {
          // New election
          newElection();
          goToBasic();
        }
    }

    var states =[ 'admin.dashboard', 'admin.basic', 'admin.questions', 'admin.censusConfig', 'admin.census', 'admin.auth', 'admin.tally', 'admin.successAction', 'admin.adminFields', 'admin.create'];

    var plugins_data = {states: [] };
    Plugins.hook('add-dashboard-election-states', plugins_data);
    states = states.concat(plugins_data.states);

    if (states.indexOf($scope.state) >= 0) {
        $scope.sidebarlinks = [
            {name: 'basic', icon: 'university'},
            {name: 'questions', icon: 'question-circle'},
            {name: 'auth', icon: 'unlock'},
            {name: 'censusConfig', icon: 'newspaper-o'},
            {name: 'census', icon: 'users'},
            //{name: 'successAction', icon: 'star-o'},
            {name: 'adminFields', icon: 'user'},
            //{name: 'tally', icon: 'pie-chart'},
        ];
        // if showSuccessAction is true,
        // show the SuccessAction tab in the admin gui
        if (true === ConfigService.showSuccessAction) {
           $scope.sidebarlinks = $scope.sidebarlinks.concat([{name: 'successAction', icon: 'star-o'}]);
        }

        if (!id) {
            $scope.sidebarlinks.push({name: 'create', icon: 'rocket'});
            var current = ElectionsApi.currentElection;
            if (!current.title) {
                current = newElection();
            }
            $scope.current = current;
            $scope.isTest = !$scope.current['real'];
        }
    } else {
        $scope.sidebarlinks = [];
    }
    var sidebar_plugins = $scope.plugins.list.filter(
      function (plug) {
        return true === plug.sidebarlink && _.isString(plug.before);
    });
    $scope.sidebarlinks.forEach( function (sidebarlink) {
      sidebarlink.plugins = sidebar_plugins.filter(function (plug) {
        return 'admin.' + sidebarlink.name === plug.before;
      });
    });
    $scope.sidebarlinks.forEach(
      function (sidebarlink) {
        next_states = next_states.concat(_.map(
          sidebarlink.plugins,
          function (plug) {
            return plug.link;
        }));
        next_states.push('admin.' + sidebarlink.name);
    });
    updateStates();
    NextButtonService.setStates(next_states);

    if (!id) {
      DraftElection.updateDraft();
    }
  }
);
