# Musculus

![Mus Musculus Musculus](https://github.com/johanhalse/musculus/blob/main/musculus.png?raw=true)

Like Stimulus, but _a lot_ smaller and a bit more webcomponenty? The entire library weighs less than 5kB unminified.

## Installation

Add it to your package.json somehow:

```bash
npm install -S @johanhalse/musculus
```

## Importing and using

After installing it to your computer, you are free to import it in your JavaScript files, like this:

```javascript
import { Application, Controller } from "@johanhalse/musculus";
```

The package is published as a JavaScript module with the extension `.mjs`. Maybe that's not your jam! But I have no idea which formats or transpilation targets are _du jour_ in the greater JS world at the moment. ES Modules are what browsers enjoy working with, so that's what I'll enjoy too. I think this means you have to set `"type": "module"` in your package.json.

## Usage

If you've used [Stimulus](https://stimulus.hotwired.dev) before, you pretty much know how to use Musculus. You wire up *Controllers* to the already-existing markup you've sent to someone's browser.

### Initialization

One key difference is that Musculus leverages Web Components to handle its lifecycle. The components themselves are very similar. While the controller itself might just as well have come from Stimulus:

```javascript
import { Controller } from "@johanhalse/musculus";

export default class ThingController extends Controller {
  connect() {
    console.log("Hello world.");
  }

  runFunction() {
    this.innerHTML = "I'm clicked!";
  }
}
```

The Stimulus HTML to initialize a controller would look something like this, however:

```html
<div data-controller="thing">
  <span data-action="click->thing#runFunction">Click me</span>
</div>
```

Whereas in Musculus it looks like this:

```html
<thing-controller>
  <span data-action="click->thing#runFunction">Click me</span>
</thing-controller>
```

Using Web Components we get a good-looking wrapper and a component lifecycle handled for us by the browser, and everybody wins! If you're wondering how to layer two or more controllers on an element, this would be a good way:

```html
<thing-controller>
  <bling-controller>
    <span data-action="click->thing#runFunction click->bling#runAnotherFunction">Click me</span>
  </bling-controller>
</thing-controller>
```

### The Application object

The Application object is a little singleton object that sits on top of your controllers and handles the global responsibilities of your app. In order to actually get your controllers working, you need to call `Application.start()`:

```javascript
import { Application } from "@johanhalse/musculus";
import ThingController from "./controllers/thing-controller.js";
import BlingController from "./controllers/bling-controller.js";

Application.register(ThingController);
Application.register(BlingController);
Application.start(window);

```

Note how you don't have to give the `register` function a name! It'll register a web component with the correct name, inferred from your class. If you're uglifying your JS, that might not work! Let's see if that can be solved later.

## Testing

The story around testing Stimulus has always been "run it through a browser or something, idk" and that never sat well with me. So Musculus has been designed for quick and painless testing from the beginning! It ships with a test adapter and CLI that lets you set up markup and assertions using TestDouble's brilliant [teenytest](https://github.com/testdouble/teenytest) framework. To test the ThingController above, you should create a file in your application called `test/lib/thing-controller-test.mjs` and put this in there:

```javascript
import { TestApplication, assert } from "@johanhalse/musculus/testing";
import ThingController from "../../thing-controller.js";

TestApplication.html(`
<thing-controller>
  <span data-action="click->thing#runFunction">Click me</span>
</thing-controller>
`)

export default function canUpdateHTML() {
  TestApplication.register(ThingController);
  TestApplication.start(globalThis.window);
  assert.contains("Click me", TestApplication.html());

  TestApplication.click("span");
  assert.contains("I'm clicked!", TestApplication.html());
}
```

Then you run the command `musculus` and your test should pass, really quickly!

The `TestApplication` singleton works like the `Application` you use in production, but sets up a [jsdom](https://github.com/jsdom/jsdom) window for you to play around in. It's very fast and doesn't require any fiddling with headless browsers. The `assert` class is passed along from [node](https://nodejs.org/api/assert.html#assert), and extended with a `contains` function you can use to check your application's markup. There's also a handy `click` convenience function as demonstrated above, and a more generic `TestApplication.fire(event, element)` function you can use for other HTML events.

We might need more functions going forward, but between jsdom and teenytest there's a lot of depth already. Musculus supplies the glue and lets you set up your test environment quickly and easily.

## What's missing?

Musculus isn't intended to be a 1:1 copy of Stimulus, feature-wise. The goal is to have something simpler and _a lot_ smaller, that should be reasonably easy to move to if you have an existing Stimulus codebase and you're tired of having to ship dozens of kilobytes to your users before you've even written a controller. That means that any features that are deemed less mainstream (currently defined as "do I use these?") or that carry a large enough footprint, won't be included. That currently means quite a lot of stuff! But there are also some things I'd like to implement going forward, for instance:

- Some kind of data binding for values (documented [here](https://stimulus.hotwired.dev/handbook/managing-state#using-values))
- Better event dispatching (documented [here](https://stimulus.hotwired.dev/reference/controllers#cross-controller-coordination-with-events))
- CSS Classes (documented [here](https://stimulus.hotwired.dev/reference/css-classes) although I'm a little on the fence about this one: the API is just so _wordy_)

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/johanhalse/musculus.

## License

The library is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
