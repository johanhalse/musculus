import Mixins from "./mixins.js";

export class Controller extends window.HTMLElement {
  constructor() {
    super();
    this.element = this;
    this.descriptorPattern =
      /^(?:(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  }

  bindAction(action) {
    if (action.identifier != this.name) {
      return;
    }

    action.boundFn = this[action.methodName].bind(this);
    action.listener = action.eventTarget.addEventListener(
      action.eventName || this.defaultEventName(action.eventTarget),
      action.boundFn,
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

  defineTargets() {
    if (this.constructor.targets == undefined) {
      return;
    }

    this.constructor.targets.forEach(this.mapTargets.bind(this));
  }

  mapTargets(targetName) {
    const targets = this.querySelectorAll(
      `[data-${this.name}-target="${targetName}"]`
    );

    this[targetName + "Targets"] = Array.from(targets);
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
    const dataKey = this.camelize(`${this.name}-${key}-value`);
    const val = this.dataset[dataKey];

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
      this.querySelectorAll("[data-action]")
    );

    if (this.dataset.action) {
      actionElements.push(this);
    }

    this.actions = actionElements.flatMap(this.parseAction.bind(this));
    this.actions.forEach(this.bindAction.bind(this));
  }

  connectedCallback() {
    this.name = this
      .dasherize(this.constructor.name)
      .replace("-controller-default", "")
      .replace("-controller", "");
    this.attachActions();
    this.defineValues();
    this.defineTargets();
    this.connect && this.connect();
  }

  disconnectedCallback() {
    this.disconnect && this.disconnect();
  }

  dasherize(value) {
    const dash = value.replace(
      /([A-Z])/g,
      (_, char) => `-${char.toLowerCase()}`
    );
    return dash.startsWith("-") ? dash.substr(1) : dash;
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
}
Object.assign(Controller.prototype, Mixins);
