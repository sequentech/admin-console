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
    var EC = protractor.ExpectedConditions;

    // go to create the election
    console.log("entering /admin/new/");
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
    console.log("clicking /admin/create/");
    await createEl.click();
    browser.wait(
      EC.urlIs('/admin/create/'),
      browser.params.timeout.ECstandards,
      "/admin/basic/ didn't redirect to /admin/create/ as expected"
    );
    console.log("entered /admin/create/");

    // click on edit json to change it to our test-election json
    var editJsonEl = element(
      by.css('[av-admin-create] .fa-pencil')
    );
    expect(editJsonEl.isPresent()).toBe(true);
    console.log("entering edit json modal");
    await editJsonEl.click();

    // change textarea with election json 
    var electionJsonEl = element(by.model('electionJson.model'));
    expect(electionJsonEl.isPresent()).toBe(true);
    console.log("editing json election");
    await electionJsonEl.clear().sendKeys(electionData);

    // save the new json
    var saveEl = element(
      by.css('[modal-window] .modal-footer button.btn-success')
    );
    expect(saveEl.isPresent()).toBe(true);
    console.log("saving election json election");
    await saveEl.click();

    // Expect no errors in the json
    var errorsEls = element.all(by.repeater('error in errors'));
    expect(errorsEls.count()).toEqual(0);

    // Procceed to create the election
    var createButtonEl = element(
      by.css('[av-admin-create] .form-group button.btn.btn-block.btn-success')
    );
    expect(createButtonEl.isPresent()).toBe(true);
    expect(createButtonEl.getAttribute('disabled')).toBe(null);
    console.log("clicking create election button");
    await createButtonEl.click();

    // Wait for either an error to appear or the redirect to the created 
    // election dashboard page to happen
    var dashboardUrl = EC.urlContains('/admin/dashboard/');
    var creationError = electionCreationErrorEl(
      element(
        by.css('[av-admin-create] [av-scroll-to-bottom] p.text-brand-danger')
      )
    );
    console.log("waiting for election to be created and redirect to dashboard");
    browser.wait(
      EC.or(dashboardUrl, creationError),
      browser.params.timeout.CreateElections,
      "Election creation timedout with no visible error"
    );

    // We reached here because either we were redirected to the dashboard or
    // there was an election creation error. Check that it's the first case.
    var currentUrl = await browser.getCurrentUrl();
    expect(currentUrl)
      .toContain('/admin/dashboard/', 'Election creation error');

    // Success! Return the current election id
    console.log("waiting for election to be created and redirect to dashboard");
    var splitUrl = currentUrl.split('/admin/dashboard/');
    var electionId = Number.parseInt(splitUrl[splitUrl.length - 1]);
    console.log("returning election id = " + electionId);

    return electionId;
  };
};
module.exports = new CreateElectionPage();
/* jshint ignore:end */
