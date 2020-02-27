/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2017  Agora Voting SL <agora@agoravoting.com>

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
  .factory('NextButtonService', function($state) {
    var nextButtonService = {states: []};
    
    nextButtonService.setStates = function (states) {
      nextButtonService.states = states;
    };

    nextButtonService.goNext = function (params) {
      var present_index = nextButtonService.states.indexOf($state.current.name);
      var next_state = nextButtonService.states[(present_index + 1) % nextButtonService.states.length];
      $state.go(next_state, params);
    };

    return nextButtonService;
  });