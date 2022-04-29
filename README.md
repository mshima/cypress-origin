# cypress-origin

Reproduction for https://github.com/cypress-io/cypress/issues/21201#issuecomment-1112570038.

Requirements: java >=11, node/npm

Clone and start the application and the ionic application.
Starts (postgres, keycloak and the application at docker) and an ionic application
```
git clone https://github.com/mshima/cypress-origin.git
cd cypress-origin/bug-tracker-oauth
npm run java:docker
npm run docker:app:up
cd ../ionic4j
npm install
npm start
```

Open cypress at `cypress-origin/ionic4j`:
```
npx cypress open
```

Run any entity test.
Test will fail with `We are sorry... An error occurred, please login again through your application.`.
Cookies are missing at the secondary origin.
