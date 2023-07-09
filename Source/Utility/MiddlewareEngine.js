const {retrieveUser} = require("../DatabaseEngine/UserEngine.js");

//Middleware for determing if the user accessing the route is logged in to be able to access it.
function userLoggedIn(request, response, next)
{
    const s = request.session;
    //If the "loggedIn" property is set to true in the session allow access.
    if (s.loggedIn)
        return next();

    return response.redirect("/login");
}

//Middleware for determing if the user accessing the route is logged in and redirect them away.
//-> For stopping users that are already logged in from accessing the login page.
function isAlreadyLoggedIn(request, response, next)
{
    //If the "loggedIn" property is set to true in the session redirect the user to the index page.
    if (request.session.loggedIn)
        return response.redirect("/");
    return next();
}

//Middleware for determing if the user accessing the route has administration permissions.
function isUserAdmin(request, response, next)
{
    //If the isAdmin permission is set to "true" in the session, allow access to the route.
    if (request.session.isAdmin)
        return next();

    //Redirect the user to the index page.
    return response.redirect("/");
}

async function questionUnlocked(request, response, next)
{
    //y, x and _ are just placeholder "throw away" values.
    const {url} = request;
    //Extract the question category and identifier from the URL.
    const [_, y, category, identifier] = url.split("/");
    //Retrieve the unlocks from the user and filter them based on category.
    const {username} = request.session;
    const convertedCategory = category.toLowerCase();
    const userObject = await retrieveUser(username);
    const userUnlocks = userObject[0].unlocks;
    //Convert unlock Map to an unlock Object.
    const convertedMap = Object.fromEntries(userUnlocks);
    //Filter the retrieved unlock objects based on their category.
    const objectArray = Object.entries(convertedMap).filter(category => category[0] == convertedCategory);
    const [x, questionArray] = objectArray[0];
    //Filter the retrieve unlocked based on category by grabbing the specific question we desire by identifier.
    const [extractedQuestion] = questionArray.filter(id => id.id == identifier);
   
    //If the question is unlocked, allow access.
    if (extractedQuestion.unlocked)
        return next();

    //Otherwise, redirect the user back to the training page they were previously on.
    return response.redirect(`/training/${category}`);
}

module.exports = {
    userLoggedIn: userLoggedIn,
    isAlreadyLoggedIn: isAlreadyLoggedIn,
    isUserAdmin: isUserAdmin,
    questionUnlocked: questionUnlocked
};