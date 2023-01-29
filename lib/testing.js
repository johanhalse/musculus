import { ApplicationClass } from "./application.js";
import { JSDOM } from "jsdom";
import assert from "node:assert/strict";

assert.contains = function (needle, haystack) {
  const foo = haystack.indexOf(needle) > 1;

  if (!foo) {
    throw new assert.AssertionError({
      actual: needle,
      expected: haystack,
      operator: "contains",
      message: `HTML did not contain string "${needle}"`,
    });
  }

  return foo;
};

class TestApplication extends ApplicationClass {
  constructor() {
    super();

    const dom = new JSDOM("<html />");
    this.window = dom.window;
    this.document = this.window.document;
  }

  start() {
    this.window.addEventListener("load", this.connect.bind(this), false);
  }

  click(path) {
    const el = this.document.querySelector(path);
    this.fire("click", el);
  }

  fire(e, el) {
    const evt = this.document.createEvent("HTMLEvents");
    evt.initEvent(e, false, true);
    el.dispatchEvent(evt, true);
  }

  html(markup) {
    if (markup) {
      this.document.body.innerHTML = markup;
    }
    return this.document.body.outerHTML;
  }

  controller() {
    return this.instances[0];
  }

  element() {
    return this.instances[0].element;
  }
}

const testApplication = new TestApplication();
const controller = testApplication.controller.bind(testApplication);
const element = testApplication.element.bind(testApplication);
const html = testApplication.html.bind(testApplication);
export {
  testApplication as TestApplication,
  controller,
  element,
  html,
  assert,
};
