const assert = require("assert");
const mongoose = require("mongoose");
const {username, password} = require("../Source/Utility/Configuration.js");
const dbConnectionURL = `mongodb+srv://${username}:${password}@sentinelcluster.y40r4.gcp.mongodb.net/test`;
mongoose.connect(dbConnectionURL);

const QE = require("../Source/DatabaseEngine/QuestionEngine.js");

async function fetchUnlockObject()
{
    return await QE.buildUnlockObject();
}

//Unit testing for the construction of the unlock object.
describe("Question Engine :", function()
{
    describe("#buildUnlockObject", function()
    {
        it("Should fetch all questions and generate 6 Cross-Site Scripting Objects:", async function() 
        {
            const {xss} = await fetchUnlockObject();
            assert.equal(xss.length, 6);
        });

        it("Should fetch all questions and generate 6 SQL Injection Objects:", async function() 
        {
            const {sql} = await fetchUnlockObject();
            assert.equal(sql.length, 6);
        });

        it("Should fetch all questions and generate 6 Server Side Request Forgery Objects:", async function() 
        {
            const {ssrf} = await fetchUnlockObject();
            assert.equal(ssrf.length, 6);
        });
    });
});

//Unit testing for the retrieval of questions.
describe("Question Engine :", function()
{
        describe("#retrieveQuestions", function()
    {
        it("Should return a total of 6 XSS questions.", async function()
        {
            const questions = await QE.retrieveQuestions("XSS");
            assert.equal(questions.length, 6);
        });
    });
});

//Unit testing for the extraction of question unlock objects.
describe("Question Engine :", function()
{
    describe("#extractQuestionUnlocks", function()
    {
        it("Generate Object size of 6 for XSS", async function()
        {
            const xssQuestions = await QE.retrieveQuestions("XSS");
            const xssUnlocks = QE.extractQuestionUnlocks(xssQuestions);
            assert.equal(xssUnlocks.length, 6);
        });

        it("Generate Object size of 6 for SQL", async function()
        {
            const sqlQuestions = await QE.retrieveQuestions("SQL");
            const sqlUnlocks = QE.extractQuestionUnlocks(sqlQuestions);
            assert.equal(sqlUnlocks.length, 6);
        });

        it("Generate Object size of 6 for SSRF", async function()
        {
            const ssrfQuestions = await QE.retrieveQuestions("SSRF");
            const ssrfUnlocks = QE.extractQuestionUnlocks(ssrfQuestions);
            assert.equal(ssrfUnlocks.length, 6);
        });
    });
});

//Unit testing for the determination of the next identifier in the question list based on a category.
describe("Question Engine :", async function()
{
    describe("#determineQuestionIdentifier", function()
    {
        it("Should generate an identifier of 7 as there are currently 6 question, next ID is 7.", async function()
        {
            const generatedIdentifier = await QE.determineQuestionIdentifier("XSS");
            assert.equal(generatedIdentifier, 7);
        });
    });
});