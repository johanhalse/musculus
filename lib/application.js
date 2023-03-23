class Application {
  constructor() {
    this.controllers = {};
    this.controllerElements = [];
    this.instances = [];
  }

  start(dom) {
    this.window = window;
    this.document = document;
    this.setupObserver();
    this.connect();
  }

  setupObserver() {
    this.observer = new window.MutationObserver(this.connect.bind(this));
    this.observer.observe(this.document.documentElement || this.document.body, {
      childList: true,
      subtree: true,
    });
  }

  connect() {
    const elements = Array.from(
      this.document.querySelectorAll("[data-controller]")
    );

    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (this.controllerElements.includes(element)) {
        continue;
      }
      const controllers = element.dataset.controller.split(" ");
      controllers.forEach((j) => {
        if (this.controllers[j]) {
          this.instantiate(element, j);
        } else {
          console.warn(`No controller named '${j}' defined!`);
        }
      });
    }
  }

  instantiate(el, controllerName) {
    this.instances.push(
      new this.controllers[controllerName](el, controllerName, this)
    );
    this.controllerElements.push(el);
  }

  uninstantiate(instance) {
    const index = this.instances.indexOf(instance);

    if (index > -1) {
      this.instances.splice(index, 1);
      this.controllerElements.splice(index, 1);
    }
  }

  register(controller) {
    const tmp = new controller().constructor.name;
    let controllerName = this.dasherize(this.camelize(tmp))
      .replace("-controller-default", "")
      .replace("-controller", "");
    this.controllers[controllerName] = controller;
  }

  camelize(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) =>
      char.toUpperCase()
    );
  }

  dasherize(value) {
    return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
  }
}

const application = new Application();
export { application as Application, Application as ApplicationClass };
