import Mixins from "./mixins.js";

class Application {
  constructor() {
    this.controllers = {};
  }

  start(dom) {
    this.window = window;
    this.document = document;
    this.connect();
  }

  connect() {
    for(let key in this.controllers) {
      this.window.customElements.define(key, this.controllers[key]);
    }
  }

  register(controller) {
    let controllerName = this.dasherize(controller.name);
    this.controllers[controllerName] = controller;
  }
}
Object.assign(Application.prototype, Mixins);

const application = new Application();
export { application as Application, Application as ApplicationClass };
