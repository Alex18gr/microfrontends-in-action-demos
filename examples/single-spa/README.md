Single SPA microfrontnends example

In this example we show how we can combine multiple application together using Single SPA. We combine different frameworks and bundlers together.

Apps and Ports
- Root Config (Shell, Single-SPA app): http://localhost:
- Navbar (React 19 with Webpack): http://localhost:
- API (Webpack simple JS app): http://localhost:3002
- Customers (Angular 19 with Vite): http://localhost:3003
- Employees (Legacy Angular 9 with Webpack 4): http://localhost:3004
- Timesheet (React 19 with Vite)

Prerequisites
- Node.js 18 or later
- npm 9 or later

Quick Start (from repository root)
1) Install dependencies for all apps seperately

2) Run all apps with npm run start for each app

3) Open the Host
   http://localhost:9000
