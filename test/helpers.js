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
module.exports = {
  /**
   * @returns the Config object
   */
  getAvConfig: async function()
  {
    return await browser
      .executeAsyncScript(
        function(callback)
        {
          callback(window.avConfigData);
        }
      );
  },

  /**
   * Assumes username + password is the admin authentication method.
   */
  adminLogin: function ()
  {
    var usernameEl = element(by.css('[av-login] form input#input1'));
    var passwordEl = element(
      by.css('[av-login] form input[type=\"password\"]')
    );
    var submitEl = element(by.css('[av-login] form button[type=\"submit\"'));
    var adminUserEl = element(by.css('[av-admin-head] .profile-dropdown'));

    /**
     * Gets the login page and logins the admin user. 
     */
    this.login = async function()
    {
      var EC = protractor.ExpectedConditions;

      // enter the login page and write username and password
      await browser.get('/admin/login/');
      await usernameEl.sendKeys(browser.params.login.username);
      await passwordEl.sendKeys(browser.params.login.password);

      // submit should be enabled -> then submit
      expect(submitEl.getAttribute('disable')).toBeNull();
      await submitEl.click();

      // wait for login to work and redirect to /admin/elections
      browser.wait(
        EC.urlIs('/admin/elections'),
        browser.params.timeout.ECstandards,
        "Login didn't redirect to /admin/elections"
      );

      // check that it's logged in with the correct username shown in the top
      // navbar
      expect(await adminUserEl.getText())
        .toContain(browser.params.login.username);
    };
  }
};
/* jshint ignore:end */
