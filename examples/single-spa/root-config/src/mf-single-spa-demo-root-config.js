import {
  constructRoutes,
  constructApplications,
  constructLayoutEngine,
} from "single-spa-layout";
import { registerApplication, start } from "single-spa";
import 'zone.js'; // Required for legacy Angular apps

import * as Api from '@mf-single-spa-demo/api';

System.set('app:@mf-single-spa-demo/api', Api);

System.addImportMap({
    "imports": {
        "@mf-single-spa-demo/api": "app:@mf-single-spa-demo/api"
    }
});

const routes = constructRoutes(document.querySelector("#single-spa-layout"), {
  loaders: {
    topNav: "<h1>Loading topnav</h1>",
  },
  errors: {
    topNav: "<h1>Failed to load topnav</h1>",
  },
});

const applications = constructApplications({
  routes,
  loadApp: ({ name }) => import(/* webpackIgnore: true */ name),
});

registerApplication({
  name: "@mf-single-spa-demo/employees-legacy",
  app: () => System.import("@mf-single-spa-demo/employees-legacy"),
  activeWhen: ["/employees"],
});

registerApplication({
  name: "@mf-single-spa-demo/timesheet",
  app: () => import(/* webpackIgnore: true */ '@mf-single-spa-demo/timesheet'),
  activeWhen: ["/timesheet"],
});

registerApplication({
  name: "@mf-single-spa-demo/customers",
  app: () => import(/* webpackIgnore: true */ '@mf-single-spa-demo/customers'),
  activeWhen: ["/customers"],
});

// Delay starting the layout engine until the styleguide CSS is loaded
const layoutEngine = constructLayoutEngine({
  routes,
  applications,
  active: false,
});

applications.forEach(registerApplication);

import(/* webpackIgnore: true */ "@react-mf/styleguide").then(() => {
  // Activate the layout engine once the styleguide CSS is loaded
  layoutEngine.activate();
  start();
});
