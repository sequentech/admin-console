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
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  framework: 'jasmine',
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        "--headless",
        "--disable-gpu",
        "--window-size=800,600",
        "--color"
      ]
    },
    acceptInsecureCerts : true
  },
  specs: [
    '../avAdmin/**/*-webspec.js'
  ],
  jasmineNodeOpts: {
    // remove ugly protractor dot reporter
    print: function () {},
    defaultTimeoutInterval: 10000,
    includeStackTrace : true
  },
  getPageTimeout: 30000,
  allScriptsTimeout: 20000,
  onPrepare: function () {
    var SpecReporter = require('jasmine-spec-reporter').SpecReporter;
    jasmine
      .getEnv()
      .addReporter(new SpecReporter());
  },
  baseUrl: 'https://stable.sequentech.io'
}
/* jshint ignore:end */
