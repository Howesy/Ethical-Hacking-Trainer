const Question = require("../Schemas/Question.js");
const User = require("../Schemas/User.js");

async function allocateQuestion(identifier, questionData)
{
    //Extract necessary data from passed data.
    const { category, question, answer, fillerAnswerOne, fillerAnswerTwo } = questionData;
    const fillerAnswerArray = [fillerAnswerOne, fillerAnswerTwo];

    //Determine if a question already exists dependant on it's category and identifier.
    Question.exists({ category: category, identifier: identifier }, async function (error, result)
    {
        if (error) throw error;

        //If the question doesn't already exist, then begin allocation.
        if (!result)
        {
            //Construct question object based on Question Schema.
            const createdQuestion = Question({
                category: category,
                question: question,
                answer: answer,
                fillerAnswers: fillerAnswerArray,
                identifier: identifier,
                unlocked: true
            });

            //Allocate question object to database.
            await createdQuestion.save().then(function (constructedQuestion)
            {
                console.log(`Successfully implemented question into the database. \n${ constructedQuestion }`);
            }).catch(console.error);

            const unlocks = await buildUnlockObject();
            await User.updateMany({}, {unlocks: unlocks});
        }
        else
        {
            console.log("[ERROR]: [ALLOCATEQUESTION], that question identifier already exists!");
        }
    });
}

async function deallocateQuestion(category, identifier)
{
    //Delete question from database based on it's category and identifier.
    await Question.deleteOne({ category: category, identifier: identifier }).then(() => console.log(`Successfully deleted question: ${ identifier } from category: ${ category }`));
}

async function retrieveQuestion(category, identifier)
{
    return await Question.findOne({ category: category, identifier: identifier });
}

async function retrieveQuestions(category)
{
    //Retrieve all questions from database based on a category.
    return await Question.find({ category: category });
}

async function updateQuestion(category, identifier, question, answer, fillerAnswers)
{
    return await Question.updateOne({ category: category, identifier: identifier }, { question: question, answer: answer, fillerAnswers: fillerAnswers });
}

function alterQuestionLockState(category, identifier)
{
    //Retrieve the specified question and flip-flop its unlocked state.
    const retrievedQuestion = retrieveQuestion(category, identifier);
    retrievedQuestion.then(async function (rQuestion)
    {
        const { unlocked } = rQuestion;
        await Question.updateOne({ category: category, identifier: identifier }, { unlocked: !unlocked });
    });
}

async function deleteQuestion(category, identifier)
{
    //Determine if a question exists based on its category and identifier.
    Question.exists({ category: category, identifier: identifier }, async function (error, result)
    {
        if (error) throw new Error(error);

        if (result)
        {
            await Question.deleteOne({ category: category, identifier: identifier });
            console.log(`Successfully deleted question with identifier: ${ identifier } from category: ${ category }`);
        } else console.log("asd");
    });
}

async function determineQuestionIdentifier(category)
{
    const retrievedQuestions = await retrieveQuestions(category);
    if (retrievedQuestions.length == 0)
        return 1;
    //Map all question identifiers for easy access.
    const retrievedIdentifiers = retrievedQuestions.map(questions => questions.identifier);
    //Retrieve the largest identifier among all questions of a specific category.
    const largestIdentifier = Math.max(...retrievedIdentifiers);
    return largestIdentifier + 1;
}

function extractQuestionUnlocks(questions)
{
    //Construct an array of objects containg the questions identifier and a false unlock state.
    const constructedUnlocks = [];
    questions.map(information => constructedUnlocks.push({ "id": information.identifier, "unlocked": false }));
    if (constructedUnlocks[0])
        constructedUnlocks[0].unlocked = true;
    return constructedUnlocks;
}

async function buildUnlockObject()
{
    //Extract all questions contained within the database for each category.
    const xssQuestions = await retrieveQuestions("XSS");
    const sqlQuestions = await retrieveQuestions("SQL");
    const ssrfQuestions = await retrieveQuestions("SSRF");

    //Extract and construct all question unlocks for each category.
    const xssUnlocks = extractQuestionUnlocks(xssQuestions);
    const sqlUnlocks = extractQuestionUnlocks(sqlQuestions);
    const ssrfUnlocks = extractQuestionUnlocks(ssrfQuestions);
    //Build object of all extracted unlocks and store return them.
    const unlocks = {xss: xssUnlocks, sql: sqlUnlocks, ssrf: ssrfUnlocks};
    return unlocks;
}

module.exports = {
    allocateQuestion: allocateQuestion,
    deallocateQuestion: deallocateQuestion,
    retrieveQuestion: retrieveQuestion,
    retrieveQuestions: retrieveQuestions,
    updateQuestion: updateQuestion,
    alterQuestionLockState: alterQuestionLockState,
    deleteQuestion: deleteQuestion,
    determineQuestionIdentifier: determineQuestionIdentifier,
    extractQuestionUnlocks: extractQuestionUnlocks,
    buildUnlockObject: buildUnlockObject
};