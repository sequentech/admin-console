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
  .directive('avCensusField', function(Authmethod) {
    function link(scope, element, attrs) {
      if (scope.field.type === 'dict') {
        try {
          scope.dictVal = angular.fromJson(scope.c.metadata[scope.field.name]);
        } catch(e) {
          scope.dictVal = {};
        }
      } else if (scope.field.type === 'image') {
        scope.viewImage = function() {
          window.mdata = scope.c.metadata;
          Authmethod
            .getImage(scope.election.id, scope.c.metadata[scope.field.name])
            .then(
              function onSuccess(response) {
                $('#imageModalFields').empty();
                scope.election.census.extra_fields.forEach(
                  function(f) {
                    if (f.type !== 'image') {
                        var fi = scope.c.metadata[f.name];
                        $('#imageModalFields').append(f.name + ': ' + fi + '<br/>');
                    }
                  }
                );
                $('#imageModal').find('img').attr('src', response.data.img);
                $('#imageModal').modal('toggle');
            });
          return false;
        };
      }
    }

    return {
      restrict: 'AE',
      link: link,
      scope: true,
      templateUrl: 'avAdmin/admin-directives/census-field/census-field.html'
    };
  });
