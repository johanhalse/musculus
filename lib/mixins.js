export default {
  camelize: function(value) {
    return value.replace(/(?:[_-])([a-z0-9])/g, (_, char) =>
      char.toUpperCase()
    );
  },

  dasherize: function(value) {
    const dash = value.replace(
      /([A-Z])/g,
      (_, char) => `-${char.toLowerCase()}`
    );
    return dash.startsWith("-") ? dash.substr(1) : dash;
  }
}
