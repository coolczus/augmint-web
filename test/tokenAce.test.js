const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const testHelper = require("./helpers/testHelper.js");

const NULL_ACC = "0x0000000000000000000000000000000000000000";
let tokenAce;

contract("TokenAce tests", accounts => {
    before(async () => {
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
    });

    it("should be possible to issue new tokens to reserve", async function() {
        const amount = 100000;
        const totalSupplyBefore = await tokenAce.totalSupply();
        const reserveBalBefore = await tokenAce.balanceOf(tokenAce.address);

        const tx = await tokenAce.issue(amount);
        testHelper.logGasUse(this, tx, "issue");
        assert(tx.logs[0].event, "Transfer");
        assert.equal(tx.logs[0].event, "Transfer", "Transfer event should be emited when tokens issued");
        assert.equal(tx.logs[0].args.from, NULL_ACC, "from should be 0x0 in transfer event event");
        assert.equal(tx.logs[0].args.to, tokenAce.address, "to should be tokenAcd address in transfer event event");
        assert.equal(tx.logs[0].args.amount.toString(), amount, "amount should be set in Transfer event");

        assert.equal(
            (await tokenAce.totalSupply()).toString(),
            totalSupplyBefore.add(amount).toString(),
            "Totalsupply should be increased with issued amount"
        );
        assert.equal(
            (await tokenAce.balanceOf(tokenAce.address)).toString(),
            reserveBalBefore.add(amount).toString(),
            "Reserve balance should be increased with issued amount"
        );
    });

    it("only allowed should issue tokens", async function() {
        await testHelper.expectThrow(tokenAce.issue(1000, { from: accounts[1] }));
    });

    it("should be possible to burn tokens from reserve", async function() {
        const amount = 900;
        await tokenAce.issue(amount);
        const totalSupplyBefore = await tokenAce.totalSupply();
        const reserveBalBefore = await tokenAce.balanceOf(tokenAce.address);

        const tx = await tokenAce.burn(amount);
        testHelper.logGasUse(this, tx, "burn");
        assert(tx.logs[0].event, "Transfer");
        assert.equal(tx.logs[0].event, "Transfer", "Transfer event should be emited when tokens issued");
        assert.equal(tx.logs[0].args.from, tokenAce.address, "from should be tokenAcd address in transfer event event");
        assert.equal(tx.logs[0].args.to, NULL_ACC, "to should be 0x0 in transfer event event");
        assert.equal(tx.logs[0].args.amount.toString(), amount, "amount should be set in Transfer event");

        assert.equal(
            (await tokenAce.totalSupply()).toString(),
            totalSupplyBefore.sub(amount).toString(),
            "Totalsupply should be decreased with issued amount"
        );
        assert.equal(
            (await tokenAce.balanceOf(tokenAce.address)).toString(),
            reserveBalBefore.sub(amount).toString(),
            "Reserve balance should be decreased with issued amount"
        );
    });

    it("only allowed should burn tokens", async function() {
        await tokenAce.issue(2000);
        await testHelper.expectThrow(tokenAce.burn(1000, { from: accounts[1] }));
    });

    it("should be possible to set transfer fees ");
    it("only owner should set transfer fees ");
});
