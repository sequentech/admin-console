/**
 * This file is part of agora-gui-admin.
 * Copyright (C) 2022 Sequent Tech Inc <legal@sequentech.io>

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

/* jshint ignore:start */
describe(
  "Admin Full Election Cycle Tests",
  function()
  {
    var helpers = require('./helpers');
    var CreateElectionPage = require('./create-election-page.js');
    var adminLogin = null;
    var simpleElection = [
      {
        "title": "E2E test election",
        "description": "This is the description of the election. You can add simple html like <strong>bold</strong> or <a href=\"https://sequentech.io\">links to websites</a>.\n\n<br><br>You need to use two br element for new paragraphs.",
        "authorities": [
          "dev-a2"
        ],
        "director": "dev-a1",
        "presentation": {
          "theme": "default",
          "share_text": [
            {
              "network": "Twitter",
              "button_text": "",
              "social_message": "I have just voted in election __URL__, you can too! #nvotes",
              "active": true
            }
          ],
          "urls": [],
          "allow_tally": true,
          "theme_css": ""
        },
        "layout": "simple",
        "num_successful_logins_allowed": 0,
        "resultsConfig": {
          "version": "master",
          "pipes": [
            {
              "type": "agora_results.pipes.results.do_tallies",
              "params": {}
            },
            {
              "type": "agora_results.pipes.sort.sort_non_iterative",
              "params": {}
            }
          ]
        },
        "census": {
          "has_ballot_boxes": false,
          "voters": [],
          "auth_method": "email",
          "census": "close",
          "extra_fields": [
            {
              "name": "email",
              "type": "email",
              "required": true,
              "unique": true,
              "min": 4,
              "max": 255,
              "required_on_authentication": true,
              "must": true
            }
          ],
          "admin_fields": [],
          "config": {
            "allow_user_resend": false,
            "msg": "Vote in __URL__ with code __CODE__",
            "subject": "Vote now with nVotes",
            "authentication-action": {
              "mode": "vote",
              "mode-config": {
                "url": ""
              }
            },
            "registration-action": {
              "mode": "vote",
              "mode-config": null
            }
          }
        },
        "questions": [
          {
            "answer_total_votes_percentage": "over-total-valid-votes",
            "answers": [
              {
                "category": "",
                "details": "This is an option with an simple example description.",
                "id": 0,
                "sort_order": 0,
                "text": "Example option 1",
                "urls": [
                  {
                    "title": "URL",
                    "url": ""
                  },
                  {
                    "title": "Image URL",
                    "url": ""
                  }
                ]
              },
              {
                "category": "",
                "details": "An option can contain a description. You can add simple html like <strong>bold</strong> or <a href=\"https://sequentech.io\">links to websites</a>. You can also set an image url below, but be sure it's HTTPS or else it won't load.\n\n<br><br>You need to use two br element for new paragraphs.",
                "id": 1,
                "sort_order": 1,
                "text": "Example option 2",
                "urls": [
                  {
                    "title": "URL",
                    "url": "https://sequentech.io"
                  },
                  {
                    "title": "Image URL",
                    "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/The_Fabs.JPG/220px-The_Fabs.JPG"
                  }
                ]
              },
              {
                "category": "",
                "details": "",
                "id": 2,
                "sort_order": 2,
                "text": "Example option 3",
                "urls": [
                  {
                    "title": "URL",
                    "url": ""
                  },
                  {
                    "title": "Image URL",
                    "url": ""
                  }
                ]
              }
            ],
            "description": "This is the description of this question. You can have multiple questions. You can add simple html like <strong>bold</strong> or <a href=\"https://sequentech.io\">links to websites</a>.\n\n<br><br>You need to use two br element for new paragraphs.",
            "layout": "accordion",
            "max": 1,
            "min": 1,
            "num_winners": 1,
            "tally_type": "plurality-at-large",
            "title": "Test question title",
            "extra_options": {
              "shuffle_categories": true,
              "shuffle_all_options": true,
              "shuffle_category_list": [],
              "show_points": false
            },
            "active": true
          }
        ],
        "extra_data": {}
      }
    ];

    /**
     * Updates the elections config with the details of current deployment
     * configuration:
     *  - election authorities
     *  - results config version
     */
    function updateElectionConfig(elections, avConfig)
    {
      _.each(
        elections,
        function (election)
        {
          election.director = avConfig.director;
          election.authorities = avConfig.authorities;
          election.resultsConfig.version = avConfig.mainVersion;
        }
      );
      return updatedElections;
    }

    /**
     * Setup the tests by logging in as an admin user.
     */
    beforeEach(
      async function ()
      {
        adminLogin = new helpers.adminLogin();
        await adminLogin.login();
      }
    );

    it(
      "Admin Full Election cycle",
      async function ()
      {
        var avConfig = await helpers.getAvConfig();
        updateElectionConfig(simpleElection, avConfig);

        // create the election
        CreateElectionPage.createElectionEditJson(electionConfig);
      }
    );
});
/* jshint ignore:end */

