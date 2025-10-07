Module Federation E-commerce Microfrontends

This example implements a Webpack Module Federation-based microfrontend architecture for a small e-commerce dashboard composed of a Host (shell) and four remotes.

Apps and Ports
- Host (Shell): http://localhost:3000
- Header (Remote 1): http://localhost:3001
- Catalog (Remote 2): http://localhost:3002
- Details (Remote 3): http://localhost:3003
- Cart & Orders (Remote 4): http://localhost:3004

Prerequisites
- Node.js 18 or later
- npm 9 or later

Quick Start (from repository root)
1) Install dependencies for all apps
   npm run mf:install:all

2) Run all apps together (concurrently)
   npm run mf:dev:all

3) Open the Host
   http://localhost:3000

Run an app individually
- Install and run only the Catalog, for example:
  npm run mf:install:catalog
  npm run mf:dev:catalog

Grouped scripts available at repo root
- Install all Module Federation apps: npm run mf:install:all
- Start all in dev mode (concurrently): npm run mf:dev:all
- Build all: npm run mf:build:all
- Per-app install: npm run mf:install:<app>
- Per-app dev: npm run mf:dev:<app>
- Per-app build: npm run mf:build:<app>
Where <app> is one of host | header | catalog | details | cart-orders

Project Layout
examples/
  module-federation/
    host/
    header/
    catalog/
    details/
    cart-orders/
