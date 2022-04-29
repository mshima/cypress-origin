/* eslint-disable @typescript-eslint/naming-convention, @typescript-eslint/no-namespace */
import './oauth2';
import { apiHost } from './config';

const authenticatedRequest = (data: any) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const tokenResponse = localStorage.getItem('CapacitorStorage.token_response');
  if (!tokenResponse) {
    return Cypress.Promise.reject('token_response is missing');
  }
  const { access_token, token_type } = JSON.parse(tokenResponse);
  return cy.request({
    ...data,
    url: apiHost + data.url,
    headers: {
      ...data.headers,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: token_type !== 'Bearer' ? access_token : `Bearer ${access_token}`,
    },
  });
};

const loginByUi = (username: string, password: string) => {
  cy.visit('/');
  cy.get('#signIn').click();
  cy.url({ timeout: 10000 }).should('includes', '/realms/');
  cy.url().then(url => {
    const { protocol, host } = new URL(url);
    // eslint-disable-next-line @typescript-eslint/no-shadow
    cy.origin(`${protocol}//${host}`, { args: { url, username, password } }, ({ url, username, password }) => {
      // Reload oauth2 login page due to cypress origin change.
      cy.visit(url);
      cy.get('input[name="username"]').type(username);
      cy.get('input[name="password"]').type(password);
      cy.get('input[type="submit"]').click();
    });
  });
  cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + 'tabs/home');
};

const loginByUiStatic = (username: string, password: string) => {
  cy.visit('/');
  cy.get('#signIn').click();
  // eslint-disable-next-line @typescript-eslint/no-shadow
  cy.origin('http://keycloak:9080', { args: { username, password } }, ({ username, password }) => {
    cy.get('input[name="username"]').type(username);
    cy.get('input[name="password"]').type(password);
    cy.get('input[type="submit"]').click();
  });
  cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + 'tabs/home');
};

const login = (username: string, password: string) => {
  cy.session(
    [username, password],
    () => {
      // cy.oauthLogin(username, password);
      // loginByUi(username, password);
      loginByUiStatic(username, password);
    },
    {
      validate: () => {
        cy.authenticatedRequest({ url: '/api/account' }).its('status').should('eq', 200);
      },
    }
  );
};

Cypress.Commands.addAll({
  authenticatedRequest,
  login,
});

declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(username: string, password: string): typeof login;
    authenticatedRequest<T = any>(options: Partial<RequestOptions>): typeof authenticatedRequest;
  }
}
