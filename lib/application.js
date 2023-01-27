class Application {
  constructor() {
    this.controllers = {};
    this.instances = [];
  }

  start(dom) {
    this.window = window;
    this.document = document;
    this.window.addEventListener("load", this.connect.bind(this), false);
  }

  connect() {
    Array.from(this.document.querySelectorAll("[data-controller]")).forEach(
      (i) => {
        const controllers = i.dataset.controller.split(" ");
        controllers.forEach((j) => {
          if (this.controllers[j]) {
            this.instances.push(new this.controllers[j](i, j));
          } else {
            console.warn(`No controller named '${j}' defined!`);
          }
        });
      }
    );
  }

  register(controller) {
    const tmp = new controller().constructor.name;
    const controllerName = this.dasherize(tmp)
      .substr(1)
      .replace("-controller", "");
    this.controllers[controllerName] = controller;
  }

  dasherize(value) {
    return value.replace(/([A-Z])/g, (_, char) => `-${char.toLowerCase()}`);
  }
}

const application = new Application();
export { application as Application, Application as ApplicationClass };
