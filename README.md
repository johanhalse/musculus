# Musculus

Like Hotwire, but a lot smaller and a lot more webcomponenty.

## Installation

Add it to your package.json somehow:

```bash
npm install -S @johanhalse/musculus
```

## Importing and using

After installing it to your computer, you are free to import it in your JavaScript files, like this:

```javascript
import { Application, Controller } from "musculus";
```

The package is published as a JavaScript module with the extension `.mjs`. Maybe that's not your jam! But I have no idea which formats or transpilation targets are _du jour_ in the greater JS world at the moment. ES Modules are what browsers enjoy working with, so that's what I'll enjoy too. I think this means you have to set `"type": "module"` in your package.json.

## Usage

If you've used [Stimulus](https://stimulus.hotwired.dev) before, you pretty much know how to use Musculus. You wire up *Controllers* to the already-existing markup you've sent to someone's browser.

### Initialization

One key difference is that Musculus leverages Web Components to handle its lifecycle. The components themselves are very similar. While the controller itself might just as well have come from Stimulus:

```javascript
import { Controller } from "musculus";

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

The Application object is a little singleton object that sits on top of your controllers and handles the more global responsibilities of your app. In order to actually get your controllers working, you need to call `Application.start()`:

```javascript
import { Application } from "musculus";
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
import { TestApplication, html, controller, assert } from "musculus";
import ThingController from "./controllers/thing-controller.js";

TestApplication.html(`
<thing-controller>
  <span data-action="click->thing#runFunction">Not the data you are looking for</span>
</thing-controller>
`)
TestApplication.register()

module.exports = function blueIsRed(){
  assert.equal(controller.querySelector("span").innerHTML, "I'm clicked!")
}
```

## Development

After checking out the repo, run `bin/setup` to install dependencies. Then, run `rake test` to run the tests. You can also run `bin/console` for an interactive prompt that will allow you to experiment.

To install this gem onto your local machine, run `bundle exec rake install`. To release a new version, update the version number in `version.rb`, and then run `bundle exec rake release`, which will create a git tag for the version, push git commits and the created tag, and push the `.gem` file to [rubygems.org](https://rubygems.org).

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/[USERNAME]/bankid.

## License

The gem is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
