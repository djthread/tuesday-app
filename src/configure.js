export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
		.plugin("aurelia-tabs")
    .developmentLogging();

  aurelia.start().then(() => aurelia.setRoot());
}
