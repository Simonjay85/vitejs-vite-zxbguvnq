describe('RBAC Player vs Admin Permissions', () => {

  it('Player App View - Should only see Check-In and Live Queue', () => {
    cy.visit('http://localhost:3000/player');
    
    // Auth as basic player
    cy.get('button').contains('Login with Google').click();
    
    // Should see wait time
    cy.contains('AI ESTIMATED WAIT TIME').should('be.visible');
    
    // Should NOT see Admin Overrides
    cy.contains('Force Stop').should('not.exist');
    cy.contains('OPERATIONS HQ').should('not.exist');
  });

  it('Admin Dashboard View - Should access overriding controls and dispute panels', () => {
    cy.visit('http://localhost:3000/admin');

    // Admin login
    cy.get('button').contains('Admin Login').click();
    cy.get('nav').contains('Live Monitoring').should('exist');
    cy.get('nav').contains('Dispute Resolution').should('exist');

    // Can manually override queue
    cy.get('.queue-list').first().click();
    cy.get('button').contains('Approve AI Suggestion').should('be.visible');
  });

});
