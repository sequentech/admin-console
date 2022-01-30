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

var helpers = require('../test/helpers');

/* jshint ignore:start */
describe("Admin Login tests", function() {
  beforeEach(async function () {
    var adminLogin = new helpers.adminLogin();
    await adminLogin.login();
  });

  it(
    "Admin Login site should load with avConfig defined page title",
    async function () {
      var avConfig = await helpers.getAvConfig();
      expect(await browser.getTitle())
        .toEqual(avConfig.webTitle);
    }
  );

  /*
  it("should open form for add new question", function() {
    var el = element(by.id('newq'));
    expect(element(by.id('nq')).isDisplayed()).toBe(false);
    el.click();
    expect(element(by.id('nq')).isDisplayed()).toBe(true);
  });

  it("should throw error: Enter a valid election title", function() {
    expect(element(by.repeater('e in election.errors')).isPresent()).toBe(false);
    element(by.css('.glyphicon-save')).click();
    expect(element(by.repeater('e in election.errors')).isPresent()).toBe(true);
    var results = element.all(by.repeater('e in election.errors'));
    expect(results.count()).toEqual(3);
    expect(results.first().getText()).toEqual('Enter a valid election title');
    expect(results.get(0).getText()).toEqual('Enter a valid election title');
  });

  it("should throw error: Enter a valid election description", function() {
    expect(element(by.repeater('e in election.errors')).isPresent()).toBe(false);
    var name = element(by.id('name'));
    name.sendKeys("test");
    element(by.css('.glyphicon-save')).click();
    expect(element(by.repeater('e in election.errors')).isPresent()).toBe(true);
    var results = element.all(by.repeater('e in election.errors'));
    expect(results.first().getText()).toEqual('Enter a valid election description');
  });

  it("should throw error: Add at least one question", function() {
    expect(element(by.repeater('e in election.errors')).isPresent()).toBe(false);
    var name = element(by.id('name'));
    name.sendKeys("test");
    var desc = element(by.id('desc'));
    desc.sendKeys("test description");
    element(by.css('.glyphicon-save')).click();
    expect(element(by.repeater('e in election.errors')).isPresent()).toBe(true);
    var results = element.all(by.repeater('e in election.errors'));
    expect(results.first().getText()).toEqual('Add at least one question');
  });

  it("should throw error: Enter a valid question title", function() {
    expect(element(by.repeater('e in newquestion.errors')).isPresent()).toBe(false);
    element(by.id('newq')).click();
    element(by.id('saveq')).click();
    expect(element(by.repeater('e in newquestion.errors')).isPresent()).toBe(true);
    var results = element.all(by.repeater('e in newquestion.errors'));
    expect(results.first().getText()).toEqual('Enter a valid question title');
  });

  it("should throw error: Add at least one option", function() {
    expect(element(by.repeater('e in newquestion.errors')).isPresent()).toBe(false);
    element(by.id('newq')).click();
    var qtext = element(by.id('qtext'));
    qtext.sendKeys("test question");
    element(by.id('saveq')).click();
    expect(element(by.repeater('e in newquestion.errors')).isPresent()).toBe(true);
    var results = element.all(by.repeater('e in newquestion.errors'));
    expect(results.first().getText()).toEqual('Add at least one option');
  });

  it("should add one option", function() {
    element(by.id('newq')).click();
    var qtext = element(by.id('qtext'));
    qtext.sendKeys("test question");
    element(by.id('newopt')).click();
    element(by.id('saveq')).click();
    expect(element(by.repeater('e in newquestion.errors')).isPresent()).toBe(false);
    expect(element(by.repeater('q in questions')).isPresent()).toBe(true);
    var results = element.all(by.repeater('q in questions'));
    expect(results.count()).toEqual(1);
  });

  it("should create a new election", function() {
    var name = element(by.id('name'));
    name.sendKeys("test");
    var desc = element(by.id('desc'));
    desc.sendKeys("test description");

    element(by.id('newq')).click();
    var qtext = element(by.id('qtext'));
    qtext.sendKeys("test question");
    element(by.id('newopt')).click();
    element(by.id('saveq')).click();

    element(by.css('.glyphicon-save')).click();
    expect(element(by.repeater('e in election.errors')).isPresent()).toBe(false);
  });
  */

});
/* jshint ignore:end */

