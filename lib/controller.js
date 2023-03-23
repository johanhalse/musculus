export class Controller {
  constructor(el, name, application) {
    if (el == null) {
      return;
    }
    this.descriptorPattern =
      /^(?:(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
    this.element = el;
    this.name = name;
    this.application = application;
    this.actions = [];
    this.setupObserver();
    this.defineValues();
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
      this.unlisten();
      this.application.uninstantiate(this);
    }
  }

  unlisten() {
    for (var i = this.actions.length - 1; i >= 0; i--) {
      const action = this.actions[i];
    }
  }

  defineTargets() {
    if (this.constructor.targets == undefined) {
      return;
    }

    this.constructor.targets.forEach(this.mapTargets.bind(this));
  }

  mapTargets(targetName) {
    const targets = this.element.querySelectorAll(
      `[data-target="${this.name}#${targetName}"]`
    );

    this[targetName + "Targets"] = targets;
    this[targetName + "Target"] = targets[0];
  }

  defineValues() {
    if (this.constructor.values == undefined) {
      return;
    }

    const keys = Object.keys(this.constructor.values);
    keys.forEach(this.mapValues(this.constructor.values).bind(this));
  }

  mapValues(values) {
    return function (key) {
      this[key + "Value"] = this.parseValue(key, values[key]);
    };
  }

  parseValue(key, keyType) {
    const dataKey = this.application.camelize(`${this.name}-${key}-value`);
    const val = this.element.dataset[dataKey];

    if (val == undefined) {
      return undefined;
    }

    switch (keyType) {
      case Array:
        return JSON.parse(val);
      case Boolean:
        return !(val == "0" || val == "false");
      case Number:
        return Number(val);
      case Object:
        return JSON.parse(val);
      default:
        return val;
    }
  }

  attachActions() {
    const actionElements = Array.from(
      this.element.querySelectorAll("[data-action]")
    );

    if (this.element.dataset.action) {
      actionElements.push(this.element);
    }

    this.actions = actionElements.flatMap(this.parseAction.bind(this));
    this.actions.forEach(this.bindAction.bind(this));
  }

  bindAction(action) {
    if (action.identifier != this.name) {
      return;
    }

    action.listener = action.eventTarget.addEventListener(
      action.eventName || this.defaultEventName(action.eventTarget),
      this[action.methodName].bind(this),
      false
    );
  }

  parseAction(el) {
    const actions = el.dataset.action.split(" ");
    return actions.map(this.parseActionDescriptorString(el).bind(this));
  }

  parseActionDescriptorString(el) {
    return function (descriptorString) {
      const source = descriptorString.trim();
      const matches = source.match(this.descriptorPattern) || [];
      let eventName = matches[1];
      let keyFilter = matches[2];

      if (keyFilter && !["keydown", "keyup", "keypress"].includes(eventName)) {
        eventName += `.${keyFilter}`;
        keyFilter = "";
      }

      return {
        eventTarget: this.parseEventTarget(matches[3]) || el,
        eventName,
        eventOptions: matches[6] ? this.parseEventOptions(matches[6]) : {},
        identifier: matches[4],
        methodName: matches[5],
        keyFilter,
      };
    };
  }

  parseEventTarget(eventTargetName) {
    if (eventTargetName == "window") {
      return window;
    }
    if (eventTargetName == "document") {
      return document;
    }
  }

  parseEventOptions(eventOptions) {
    return eventOptions.split(":").reduce(
      (options, token) =>
        Object.assign(options, {
          [token.replace(/^!/, "")]: !/^!/.test(token),
        }),
      {}
    );
  }

  defaultEventName(el) {
    switch (el.nodeName) {
      case "DETAILS":
        return "toggle";
      case "FORM":
        return "submit";
      case "INPUT":
        if (el.type.toLowerCase() == "submit") {
          return "click";
        }
        return "input";
      case "SELECT":
        return "change";
      case "TEXTAREA":
        return "change";
      default:
        return "click";
    }
  }

  connect() {}
  disconnect() {}
}
