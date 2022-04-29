import { entityItemSelector } from '../../support/commands';
import {
  entityTableSelector,
  entityDetailsButtonSelector,
  entityDetailsBackButtonSelector,
  entityCreateButtonSelector,
  entityCreateSaveButtonSelector,
  entityCreateCancelButtonSelector,
  entityEditButtonSelector,
  entityDeleteButtonSelector,
  entityConfirmDeleteButtonSelector,
} from '../../support/entity';

describe('Attachment e2e test', () => {
  const attachmentPageUrl = '/attachment';
  const attachmentPageUrlPattern = new RegExp('/attachment(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const attachmentSample = { name: 'sky Washington', file: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci5wbmc=', fileContentType: 'unknown' };

  let attachment: any;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/attachments+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/attachments').as('postEntityRequest');
    cy.intercept('DELETE', '/api/attachments/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (attachment) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/attachments/${attachment.id}`,
      }).then(() => {
        attachment = undefined;
      });
    }
  });

  it('Attachments menu should load Attachments page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('attachment');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response!.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Attachment').should('exist');
    cy.url().should('match', attachmentPageUrlPattern);
  });

  describe('Attachment page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(attachmentPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Attachment page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/attachment/new$'));
        cy.getEntityCreateUpdateHeading('Attachment');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', attachmentPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/attachments',
          body: attachmentSample,
        }).then(({ body }) => {
          attachment = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/attachments+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [attachment],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(attachmentPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Attachment page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('attachment');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', attachmentPageUrlPattern);
      });

      it('edit button click should load edit Attachment page', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Attachment');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', attachmentPageUrlPattern);
      });

      it('last delete button click should delete instance of Attachment', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('attachment').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response!.statusCode).to.equal(200);
        });
        cy.url().should('match', attachmentPageUrlPattern);

        attachment = undefined;
      });
    });
  });

  describe('new Attachment page', () => {
    beforeEach(() => {
      cy.visit(`${attachmentPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Attachment');
    });

    it('should create an instance of Attachment', () => {
      cy.get(`[data-cy="name"]`).type('structure Investor Cross-platform').should('have.value', 'structure Investor Cross-platform');

      cy.setFieldImageAsBytesOfEntity('file', 'integration-test.png', 'image/png');

      // since cypress clicks submit too fast before the blob fields are validated
      cy.wait(200); // eslint-disable-line cypress/no-unnecessary-waiting
      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response!.statusCode).to.equal(201);
        attachment = response!.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response!.statusCode).to.equal(200);
      });
      cy.url().should('match', attachmentPageUrlPattern);
    });
  });
});
