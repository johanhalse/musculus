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
      message: `Could not find string "${needle}"\n\n${haystack}`,
    });
  }

  return foo;
};

class TestApplication extends ApplicationClass {
  constructor() {
    super();

    const dom = new JSDOM("<!DOCTYPE html><html><head></head><body></body></html>");
    this.window = dom.window;
    this.document = this.window.document;
    globalThis.window = this.window
    globalThis.document = this.document;
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
}

const testApplication = new TestApplication();
export { testApplication as TestApplication, assert };
