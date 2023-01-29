export class Controller {
  constructor(el, name, application) {
    if (el == null) {
      return;
    }
    this.element = el;
    this.name = name;
    this.application = application;
    this.setupObserver();
    this.defineTargets();
    this.attachActions();
    this.connect();
  }

  setupObserver() {
    this.observer = new this.application.window.MutationObserver(
      this.checkIfRemoved.bind(this)
    );
    this.observer.observe(this.element.parentElement, {
      childList: true,
    });
  }

  checkIfRemoved(records, observer) {
    const removedNodes = records.flatMap((i) => Array.from(i.removedNodes));
    if (removedNodes.includes(this.element)) {
      this.disconnect();
      this.observer.disconnect();
      this.application.uninstantiate(this);
    }
  }

  defineTargets() {
    const targetElements = Array.from(
      this.element.querySelectorAll("[data-target]")
    );
    targetElements.forEach((el) => {
      const targets = el.dataset.target.split(" ");
      targets.forEach((target) => {
        const [controllerName, targetName] = target.split("#");
        if (controllerName == this.name) {
          this[targetName + "Target"] = el;
        }
      });
    });
  }

  attachActions() {
    const actionElements = Array.from(
      this.element.querySelectorAll("[data-action]")
    );

    actionElements.forEach((el) => {
      const actions = el.dataset.action.split(" ");
      actions.forEach((action) => {
        const [eventName, fn] = action.split("->");
        const [controllerName, actionName] = fn.split("#");
        if (controllerName == this.name) {
          el.addEventListener(eventName, this[actionName].bind(this));
        }
      });
    });
  }

  connect() {}
  disconnect() {}
}
