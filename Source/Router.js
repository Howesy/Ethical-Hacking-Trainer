const application = require("../server.js");
const { isAlreadyLoggedIn, userLoggedIn, isUserAdmin, questionUnlocked } = require("./Utility/MiddlewareEngine");
const { addUser, retrieveUser, retrieveUsers, getUserModel, comparePassword, updateUserUnlocks } = require("./DatabaseEngine/UserEngine");
const { retrieveQuestion, retrieveQuestions, deleteQuestion, updateQuestion, allocateQuestion, determineQuestionIdentifier } = require("./DatabaseEngine/QuestionEngine");

//Code to simplistically server views stored in "Website/views"
//Serve login view with no extra data using the "isAlreadyLoggedIn" middleware.
serveView("login", null, isAlreadyLoggedIn);
serveView("register", null, isAlreadyLoggedIn);
//Serve allocateQuestion view with no extra data using the "userLoggedIn" and "isUserAdmin" middleware.
serveView("allocateQuestion", null, userLoggedIn, isUserAdmin);
serveView("examples");
serveView("training");
serveView("xssExample");
serveView("sqlExample");
serveView("ssrfExample");
serveView("disclaimer");

//Render account page, [REQUIRES]: User to be logged in to access.
application.get("/account", userLoggedIn, async function (request, response)
{
    //Retrieve the current user logged into the ethical hacking trainer.
    const { username } = request.session;
    const [userObject] = await retrieveUser(username);
    //Convert the users unlock map to an object for easy access.
    const userUnlocks = userObject.unlocks;
    const convertedUnlockMap = Object.fromEntries(userUnlocks);
    const { xss, sql, ssrf } = convertedUnlockMap;
    const userCompletionArray = [];

    //Retrieve total amount of questions from each section.
    const xssTotal = xss.length;
    const sqlTotal = sql.length;
    const ssrfTotal = ssrf.length;

    //Retrieve total amount of completed questions from each section.
    let xssCompletedTotal = xss.filter(unlocks => unlocks.unlocked == true).length;
    let sqlCompletedTotal = sql.filter(unlocks => unlocks.unlocked == true).length;
    let ssrfCompletedTotal = ssrf.filter(unlocks => unlocks.unlocked == true).length;

    //Logic to account for the first initially unlocked question, displaying the correct amount of completed questions.
    if (xssTotal > 1)
        xssCompletedTotal -= 1;

    if (sqlTotal > 1)
        sqlCompletedTotal -= 1;

    if (ssrfTotal > 1)
        ssrfCompletedTotal -= 1;


    //Push pre-generated strings with information to array and pass to EJS engine to render.
    userCompletionArray.push(`Completed ${ xssCompletedTotal } out of ${ xssTotal } XSS questions.`);
    userCompletionArray.push(`Completed ${ sqlCompletedTotal } out of ${ sqlTotal } SQL questions.`);
    userCompletionArray.push(`Completed ${ ssrfCompletedTotal } out of ${ ssrfTotal } SSRF questions;`);

    //Render the account page passing the necessary data for it's construction.
    response.render("account", { session: request.session, user: userObject, completions: userCompletionArray });
});

//Render admin page, [REQUIRES]: User to be logged in and an administrator to access.
application.get("/admin", userLoggedIn, isUserAdmin, async function (request, response) 
{
    //Retrieve all questions from each category on the ethical hacking trainer.
    const xssQuestions = await retrieveQuestions("XSS");
    const sqlQuestions = await retrieveQuestions("SQL");
    const ssrfQuestions = await retrieveQuestions("SSRF");

    const currentUsersAmount = (await retrieveUsers()).length;
    const currentXSSAmount = xssQuestions.length;
    const currentSQLAmount = sqlQuestions.length;
    const currentssrfAmount = ssrfQuestions.length;

    //Render admin page with the required data.
    return response.render("admin", {
        session: request.session,
        dataAmounts: [currentXSSAmount, currentSQLAmount, currentssrfAmount, currentUsersAmount],
        questions: [xssQuestions, sqlQuestions, ssrfQuestions]
    });
});

//Render leaderboard page, [REQUIRES]: N/A
application.get("/leaderboard", async function(request, response)
{
    const allUsers = await retrieveUsers();
    const leaderboardInformation = [];

    //Sort all users in descending order based on the amount of completed questions.
    allUsers.sort(function(a, b)
    {
        //Retrieve "a"'s unlock Map and convert to an object for easy access.
        const aUnlocks = a.unlocks;
        const aConvertedUnlockMap = Object.fromEntries(aUnlocks);
        //Retrieve "a"'s total completed questions from each section and sum them together.
        const axssTotal = aConvertedUnlockMap.xss.filter(unlocks => unlocks.unlocked == true).length;
        const asqlTotal = aConvertedUnlockMap.sql.filter(unlocks => unlocks.unlocked == true).length;
        const assrfTotal = aConvertedUnlockMap.ssrf.filter(unlocks => unlocks.unlocked == true).length;
        const aCompletedTotal = axssTotal + asqlTotal + assrfTotal;

        //Retrieve "b"'s unlock Map and convert to an object for easy access.
        const bUnlocks = b.unlocks;
        const bConvertedUnlockMap = Object.fromEntries(bUnlocks);
        //Retrieve "b"'s total completed questions from each section and sum them together.
        const bxssTotal = bConvertedUnlockMap.xss.filter(unlocks => unlocks.unlocked == true).length;
        const bsqlTotal = bConvertedUnlockMap.sql.filter(unlocks => unlocks.unlocked == true).length;
        const bssrfTotal = bConvertedUnlockMap.ssrf.filter(unlocks => unlocks.unlocked == true).length;
        const bCompletedTotal = bxssTotal + bsqlTotal + bssrfTotal;

        //Return the reverse to retrieve the descending order.
        return bCompletedTotal - aCompletedTotal;
    });

    allUsers.forEach(function(user)
    {
        //Retrieve each users unlocks and convert their unlock Map to an object for easy access.
        const {username, unlocks} = user;
        const convertedUnlockMap = Object.fromEntries(unlocks);
        console.log(convertedUnlockMap);
        const { xss, sql, ssrf } = convertedUnlockMap;
        //Retrieve the total amount of questions for each section on the ethical hacking trainer.
        const xssTotal = xss.length;
        const sqlTotal = sql.length;
        const ssrfTotal = ssrf.length;
        //Retrieve the total amounnt of completed questions for each section on the ethical hacking trainer.
        let xssCompletedTotal = xss.filter(unlocks => unlocks.unlocked == true).length;
        let sqlCompletedTotal = sql.filter(unlocks => unlocks.unlocked == true).length;
        let ssrfCompletedTotal = ssrf.filter(unlocks => unlocks.unlocked == true).length;
    
        //Logic to account for the first initially unlocked question, displaying the correct amount of completed questions.
        if (xssTotal > 1)
            xssCompletedTotal -= 1;
    
        if (sqlTotal > 1)
            sqlCompletedTotal -= 1;
    
        if (ssrfTotal > 1)
            ssrfCompletedTotal -= 1;
        //Generate a pre-made string to pass to the EJS engine to render on the leaderboard page.
        const progressString = `XSS: ${xssCompletedTotal}/${xssTotal} | SQL: ${sqlCompletedTotal}/${sqlTotal} | SSRF: ${ssrfCompletedTotal}/${ssrfTotal}`;
        leaderboardInformation.push({ username: username, data: progressString });
    });

    //Render admin page with the approrpiate data for its construction.
    return response.render("leaderboard", { session: request.session, leaderboardInformation: leaderboardInformation });
});

//Render index (home) page, [REQUIRES]: N/A
application.get("/", function (request, response)
{
    //Render home page with session data.
    response.render("index", { session: request.session });
});

application.get("/destroySession", function (request, response)
{
    //Delete the session object stored for the user.
    request.session.destroy(function (error)
    {
        if (error) throw new Error(error);
        response.redirect("/");
    });
});

//Render training page based on specified category, [REQUIRES]: User to be logged in to access.
application.get("/training/:category", userLoggedIn, async function (request, response) 
{
    const { category } = request.params;
    const { username } = request.session;
    const acceptedCategories = ["XSS", "SQL", "SSRF"];
    if (!acceptedCategories.includes(category))
        return response.render("error", { session: request.session, error: "Invalid category specified, please choose either: XSS or SQL or SSRF" });

    //Retrieve the unlocks of the currently logged in user.
    const convertedCategory = category.toLowerCase();
    const userObject = await retrieveUser(username);
    const userUnlocks = userObject[0].unlocks;
    //Convert the unlock <Map> to an unlock <Object>
    const convertedMap = Object.fromEntries(userUnlocks);
    //Filter unlock <Object> by the currently accessed category.
    const objectArray = Object.entries(convertedMap).filter(category => category[0] == convertedCategory);
    const [_, questionInformation] = objectArray[0];
    const extractedUnlocks = questionInformation;
    const retrievedQuestions = await retrieveQuestions(category);
    //Render questions page with the appropriate information for its rendering.
    response.render("questions", { session: request.session, questions: retrievedQuestions, category: category, questionUnlocks: extractedUnlocks });
});

//Route for deleting a question based on its category and identifier, [REQUIRES]: User to be logged in and an administrator to access.
application.get("/deleteQuestion/:category/:identifier", userLoggedIn, isUserAdmin, async function (request, response)
{
    const { category, identifier } = request.params;
    const acceptedCategories = ["XSS", "SQL", "SSRF"];

    if (!acceptedCategories.includes(category))
    {
        return response.render("error", { session: request.session, error: "Invalid category specified, please choose either: XSS or SQL or ssrf" });
    }
    else 
    {
        await deleteQuestion(category, identifier);
        return response.redirect("/admin");
    }
});

//Render updating question page based on its category and identifier, [REQUIRES]: User to be logged in and an administrator to access.
application.get("/updateQuestion/:category/:identifier", userLoggedIn, isUserAdmin, async function (request, response)
{
    const { category, identifier } = request.params;
    const retrievedQuestion = await retrieveQuestion(category, identifier);
    return response.render("updateQuestion", { session: request.session, question: retrievedQuestion });
});

//Render view question page based on category and identifier, [REQUIRES]: User to be logged in and an administrator to access.
application.get("/viewQuestion/:category/:identifier", userLoggedIn, questionUnlocked,  async function (request, response)
{
    const { category, identifier } = request.params;
    const { username } = request.session;
    //Retrieve the current question and the users unlocks
    const convertedCategory = category.toLowerCase();
    const retrievedQuestion = await retrieveQuestion(category, identifier);
    const userObject = await retrieveUser(username);
    const userUnlocks = userObject[0].unlocks;
    //Convert the unlock <Map> to an unlock <Object.
    const convertedMap = Object.fromEntries(userUnlocks);
    const objectArray = Object.entries(convertedMap);
    //Filter the unlock <Object> based on the current category.
    const filteredQuestions = objectArray.filter(category => category[0] == convertedCategory);
    const [_, questionObjects] = filteredQuestions[0];
    //Filter all user unlocks based on solely unlocked questions.
    const extractedUnlocks = questionObjects.filter(question => question.unlocked == true);
    //Get current amount of questions stored in the ethical hacking trainer.
    const allQuestionsLength = (await retrieveQuestions(category)).length;
    const completedQuestionPercentage = Math.trunc(((extractedUnlocks.length - 1) / allQuestionsLength) * 100);
    //"Randomly" shuffle answer array.
    const shuffledAnswers = [retrievedQuestion.answer, ...retrievedQuestion.fillerAnswers].sort(() => Math.random() - 0.5);

    //Render question page with necessary data.
    return response.render("question", 
    {
        session: request.session,
        question: retrievedQuestion,
        completionPercentage: completedQuestionPercentage,
        answers: shuffledAnswers 
    });
});

//Route for registering user to the user database.
application.post("/initiateRegister", function (request, response)
{
    const s = request.session;
    addUser(request.body).then(function (functionResponse)
    {
        //If the user is registered successfully redirect them to the login page.
        if (functionResponse)
        {
            response.redirect("/login");
        } else
        {
            s.userError = "A user with that username already exists!";
            response.redirect("/register");
        }

    }).catch(console.error);
});

//Route for logging in a user and setting their necessary session variables.
application.post("/initiateLogin", async function (request, response)
{
    const { username, password } = request.body;
    const userModel = getUserModel();
    const s = request.session;

    //Check if the user exists in the database based off of the username that they have entered.
    userModel.exists({ username: username }, async function (error, result)
    {
        if (error) throw new Error(error);

        if (!result)
        {
            s.userError = "Invalid login! User details are incorrect, no user detected for this username.";
            return response.redirect("/login");
        }

        await retrieveUser(username).then(function (userDetails)
        {
            const [userData] = userDetails;
            const { _id } = userData;
            const storedPassword = userData.password;

            if (!comparePassword(password, storedPassword))
            {
                s.userError = "Invalid password provided.";
                return response.redirect("/login");
            }

            //Set necessary information in session object for site functionality.
            s.userID = _id.valueOf();
            s.username = username;
            s.loggedIn = true;
            s.unlocks = userData.unlocks;
            s.isAdmin = userData.isAdmin;

            return response.redirect("/");
        }).catch(console.error);
    });
});

//Route for updating a question, [REQUIRES]: The user to be logged in and an administrator to access the route.
application.post("/manipulateQuestion", userLoggedIn, isUserAdmin, async function (request, response) 
{
    //Extract necessary information from request body.
    const { category, identifier, question, answer, fillerAnswerOne, fillerAnswerTwo, unlocked } = request.body;
    const fillerQuestionArray = [fillerAnswerOne, fillerAnswerTwo];
    await updateQuestion(category, identifier, question, answer, fillerQuestionArray, unlocked);
    return response.redirect(`/viewQuestion/${ category }/${ identifier }`);
});

//Route for allocating a question to the database, [REQUIRES]: THe user to be logged in and an administrator to access the route.
application.post("/addQuestion", userLoggedIn, isUserAdmin, async function (request, response)
{
    const { category } = request.body;
    //Determine the next ID for the question to be inserted correctly into the database.
    const identifier = await determineQuestionIdentifier(category);
    await allocateQuestion(identifier, request.body);
    //Delay the redirect to the ensure the question is added before accessing the admin page again.
    return setTimeout(() => response.redirect("/admin"), 500);
});

//Route for setting the state of the next question to unlocked (Question Completion), [REQUIRES]: The user to be logged in to access the route.
application.post("/completeQuestion", userLoggedIn, async function (request, response)
{
    const { category, identifier, providedAnswer } = request.body;
    const { username } = request.session;
    const currentQuestion = await retrieveQuestion(category, identifier);

    //If the correct answer for the question is provided:
    if (providedAnswer == currentQuestion.answer)
    {
        //Retrieve the current logged in users unlocks and convert the unlock <Map> to an unlock <Object>
        const userObject = await retrieveUser(username);
        const userUnlocks = userObject[0].unlocks;
        const convertedUnlockMap = Object.fromEntries(userUnlocks);
        //Determine the next identifier in line based off the current question.
        const nextIdentifier = parseInt(identifier) + 1;
        //Retrieve the next question in line after the current answered question.
        const nextQuestion = await retrieveQuestion(category, nextIdentifier);

        //If there is another existent question after the current question.
        if (nextQuestion)
        {
            //Unlock the next question in line for the user for the correct category.
            switch (category)
            {
                case "XSS":
                    convertedUnlockMap.xss[identifier].unlocked = true;
                    break;

                case "SQL":
                    convertedUnlockMap.sql[identifier].unlocked = true;
                    break;

                case "SSRF":
                    convertedUnlockMap.ssrf[identifier].unlocked = true;
                    break;
            }
        }

        await updateUserUnlocks(username, convertedUnlockMap);
    }

    //Redirect the user back to the training category they were previously in.
    return response.redirect(`/training/${ category }`);
});

//Route for resetting a users unlocks for every course contained in the ethical hacking trainer, [REQUIRES]: The user to be logged in to access the route.
application.post("/resetCourse", userLoggedIn, async function (request, response) 
{
    //Retrieve the currently logged in users unlocks and convert the unlock <Map> to an unlock <Object>.
    const { username } = request.session;
    const [userObject] = await retrieveUser(username);
    const userUnlocks = userObject.unlocks;
    const convertedUnlockMap = Object.fromEntries(userUnlocks);
    //Retrieve the unlock object for each individual category.
    const xss = convertedUnlockMap.xss;
    const sql = convertedUnlockMap.sql;
    const ssrf = convertedUnlockMap.ssrf;

    //Set the unlock state for every question in each category to false.
    xss.forEach(question => question.unlocked = false);
    sql.forEach(question => question.unlocked = false);
    ssrf.forEach(question => question.unlocked = false);

    //Set the unlock state of the first question in each category to true so a user can begin the course.
    const firstXSSQuestion = xss[0];
    const firstSQLQuestion = sql[0];
    const firstSSRFQuestion = ssrf[0];

    if (firstXSSQuestion)
        firstXSSQuestion.unlocked = true;

    if (firstSQLQuestion)
        firstSQLQuestion.unlocked = true;

    if (firstSSRFQuestion)
        firstSSRFQuestion.unlocked = true;

    //Construct the newly resetted unlock object and update the users unlocks.
    const resetUnlocks = { xss, sql, ssrf };
    await updateUserUnlocks(username, resetUnlocks);
    return response.redirect("/");
});

//Implementation of a basic back-end error handling in case a user accesses a non-existent page.
application.use(function (request, response, next)
{
    response.render("error", { session: request.session, error: "Invalid page!" });
});

//Basic function to serve simplistic views on the fly with necessary data and desired middleware.
function serveView(webpageName, renderData = null, ...desiredMiddleware)
{
    application.get(`/${ webpageName }`, desiredMiddleware, function (request, response)
    {
        response.render(webpageName, { session: request.session, renderData: renderData });
    });
}
