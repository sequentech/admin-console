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

const { Button } = require("bootstrap");

/* jshint ignore:start */
var CreateElectionPage = function ()
{
  /**
   * Creates an election using the Edit JSON button.
   * @param {*} electionData Data of the election(s) to be created.
   * @returns {Number} Id of the (parent) created election
   *
   * Requirements: Requires Admin to be logged in, you can use helpers.login()
   * for that.
   */
  this.createElectionEditJson = async function (electionData)
  {
    // go to create the election
    await browser.get('/admin/new/');
    browser.wait(
      EC.urlIs('/admin/basic/'),
      browser.params.timeout.ECstandards,
      "/admin/new/ didn't redirect to /admin/basic/ as expected"
    );

    // go to the last create-election step
    var createEl = element(
      by.css('[av-admin-sidebar] [href="/admin/create/"]')
    );
    expect(createEl.isPresent()).toBe(true);
    await createEl.click();

    // click on edit json to change it to our test-election json
    var editJsonEl = element(
      by.css('[av-admin-create] .fa-pencil')
    );
    expect(editJsonEl.isPresent()).toBe(true);
    await editJsonEl.click();

    // change textarea with election json 
    var electionJsonEl = element(by.model('electionJson.model'));
    expect(electionJsonEl.isPresent()).toBe(true);
    await electionJsonEl.clear().sendKeys(electionData);
    
    // save the new json
    var saveEl = element(
      by.css('[modal-window] .modal-footer button.btn-success')
    );
    expect(saveEl.isPresent()).toBe(true);
    await saveEl.click();

    // Expect no errors in the json
    var errorsEls = element.all(by.repeater('error in errors'));
    expect(errorsEls.count()).toEqual(0);

    // Procceed to create the election
    var createButtonEl = element(
      by.css('[av-admin-create] .form-group Button.btn.btn-block.btn-success')
    );
    expect(createButtonEl.isPresent()).toBe(true);
    expect(createButtonEl.getAttribute('disabled')).toBe(null);
    await createButtonEl.click();

    // Wait for either an error to appear or the redirect to the created 
    // election dashboard page to happen
    var dashboardUrl = EC.urlContains('/admin/dashboard/');
    var creationError = electionCreationErrorEl(
      element(
        by.css('[av-admin-create] [av-scroll-to-bottom] p.text-brand-danger')
      )
    );
    browser.wait(
      EC.or(dashboardUrl, creationError),
      browser.params.timeout.CreateElections,
      "Election creation timedout with no visible error"
    );
    var currentUrl = await browser.getCurrentUrl();
    expect(currentUrl)
      .toContain('/admin/dashboard/', 'Election creation error');

    var splitUrl = currentUrl.split('/admin/dashboard/');
    return Number.parseInt(splitUrl[splitUrl.length - 1]);
  };
};
module.exports = new CreateElectionPage();
/* jshint ignore:end */
