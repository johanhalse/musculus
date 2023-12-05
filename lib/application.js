class Application {
  constructor() {
    this.controllers = {};
    this.controllerElements = [];
    this.instances = [];
  }

  start(dom) {
    this.window = window;
    this.document = document;
    this.connect();
  }

  connect() {
    for(let key in this.controllers) {
      customElements.define(key, this.controllers[key]);
    }
  }

  register(controller) {
    let controllerName = this.dasherize(controller.name);
    this.controllers[controllerName] = controller;
  }

  camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) =>
      char.toUpperCase()
    );
  }

  dasherize(value) {
    const dash = value.replace(
      /([A-Z])/g,
      (_, char) => `-${char.toLowerCase()}`
    );
    return dash.startsWith("-") ? dash.substr(1) : dash;
  }
}


const application = new Application();
export { application as Application, Application as ApplicationClass };
