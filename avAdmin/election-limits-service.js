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

/**
 * Generic election related constraints that apply to multiple parts of
 * the deployment, for example the same limit might apply to iam,
 * sequent-ui and ballot-box
 */
angular.module('avAdmin')
  .factory(
    'ElectionLimits',
    function()
    {
      return {
        // maximum number of questions allowed in an election
        maxNumQuestions: 20,

        // maximum number of allowed possible answers in a question
        maxNumAnswers: 10000,

        // maximum size in characters of long strings like url titles
        maxShortStringLength: 300,

        // maximum size in characters of long strings like question description
        maxLongStringLength: 3000,
      };
    }
  );