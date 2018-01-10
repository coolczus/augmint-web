describe("Augmint basic e2e", function() {
    // TODO: expose testrpc snapshot take / revert via npm and use to create clean state when needed
    before(function() {
        cy.visit("/");
        //cy.viewport("macbook-15");
        cy.contains("Try it").click();
        cy.contains("You are connected");
    });

    it("Click through main functions", function() {
        cy.contains("My Account").click();

        cy.contains("Account: 0xd912AeCb07E9F4e1eA8E6b4779e7Fb6Aa1c3e4D8");
        cy.get("#transferListDiv");
        cy.contains("Get ACE Loan").click();
        cy.contains("Select type of loan");
        cy.get("#selectLoanProduct-0").click();
        cy.contains("Selected: loan product 1");

        cy.contains("Reserves").click();
        cy.contains("Augmint Reserves");
        cy.contains("0 ACE");

        cy.get("#loansToCollectBtn").click();
        cy.contains("No defaulted and uncollected loan.");

        // TODO: Buy / Sell ACE (when new internal exchange is done)
    });

    it("Should get and repay a loan", function() {
        // TODO: use fixtures for loan amounts etc.
        cy.contains("Get ACE Loan").click();
        cy.contains("Select type of loan");
        cy.get("#selectLoanProduct-0").click();

        cy
            .get("#disbursedTokenAmount")
            .type("1000.55")
            .should("have.value", "1000.55");
        // TODO: https://github.com/cypress-io/cypress/issues/1171
        // cy.get("#loanUcdAmount").should("have.value", "1250.69");
        // cy.get("#ethAmount").should("have.value", "8.01724");
        cy.get("#repaymentAmount").type("1250.69");
        cy.get("#ethAmount").type("1.5665");

        cy.get("#userAceBalance").then(bal => {
            const aceBalanceBefore = Number(
                Cypress.$("#userAceBalance").text()
            );
            const expBal =
                Math.round((aceBalanceBefore + 1000.55) * 10000) / 10000;
            cy.get("#submitBtn").click();
            cy.contains("You've got a loan");
            cy.contains("Disbursed: 1000.55 ACE");
            cy.contains("To be repayed: 1250.69 ACE");
            cy.contains("Collateral in escrow: 1.5665 ETH");

            cy.get("#userAceBalance").contains(expBal.toString());

            //cy.contains("My Account").click();
            // TODO: check transfer history
            // TODO: check my loans
            // TODO: loan details page
            // TODO: Repayment
            // TODO: check reserves
        });
    });

    it("Should transfer ACE");

    it("Should collect a loan");
});
