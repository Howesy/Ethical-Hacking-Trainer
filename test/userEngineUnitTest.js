const assert = require("assert");
const mongoose = require("mongoose");
const {username, password} = require("../Source/Utility/Configuration.js");
const dbConnectionURL = `mongodb+srv://${username}:${password}@sentinelcluster.y40r4.gcp.mongodb.net/test`;
mongoose.connect(dbConnectionURL);

const UE = require("../Source/DatabaseEngine/UserEngine.js");

describe("User Engine :", function()
{
    describe("#retrieveUser", function()
    {
        it("Fetch the user object pertaining to the user: \"admin\"", async function()
        {
            const [retrievedUser] = await UE.retrieveUser("admin");
            assert.equal(retrievedUser.username, "admin");
        });
    });
});

describe("User Engine :", function()
{
    describe("#retrieveUsers", function()
    {
        it("Retrieve all 3 users currently stored on the database.", async function()
        {
            const retrievedUsers = await UE.retrieveUsers();
            assert.equal(retrievedUsers.length, 3);
        });
    });
});

describe("User Engine :", function()
{
    describe("Retrieving user unlocks:", function()
    {
        it("Retrieve 3 categories in regard to the unlock object.", async function()
        {
            const [userObject] = await UE.retrieveUser("admin");
            const userUnlocks = userObject.unlocks;
            const convertedUnlockMap = Object.fromEntries(userUnlocks);
            const categorySize = Object.keys(convertedUnlockMap).length;
            assert.equal(categorySize, 3);
        });
    });
});

describe("User Engine :", function()
{
    describe("Retrieving user unlocks:", function()
    {
        it("Retrieve 6 user unlock objects for Cross-Site Scripting:", async function()
        {
            const [userObject] = await UE.retrieveUser("admin");
            const userUnlocks = userObject.unlocks;
            const convertedUnlockMap = Object.fromEntries(userUnlocks);
            const {xss} = convertedUnlockMap;
            assert.equal(xss.length, 6);
        });

        it("Retrieve 6 user unlock objects for SQL:", async function()
        {
            const [userObject] = await UE.retrieveUser("admin");
            const userUnlocks = userObject.unlocks;
            const convertedUnlockMap = Object.fromEntries(userUnlocks);
            const {sql} = convertedUnlockMap;
            assert.equal(sql.length, 6);
        });

        it("Retrieve 6 user unlock objects for Server-Side Request Forgery:", async function()
        {   
            const [userObject] = await UE.retrieveUser("admin");
            const userUnlocks = userObject.unlocks;
            const convertedUnlockMap = Object.fromEntries(userUnlocks);
            const {ssrf} = convertedUnlockMap;
            assert.equal(ssrf.length, 6);
        });
    });
});