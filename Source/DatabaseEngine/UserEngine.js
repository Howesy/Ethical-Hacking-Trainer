const User = require("../Schemas/User.js");
const { extractQuestionUnlocks, retrieveQuestions } = require("./QuestionEngine.js");
const { hashSync, compareSync } = require("bcrypt");

async function addUser(userData)
{
    return new Promise(async function (resolve, reject)
    {
        //Retrieve necessary elements from passed userData.
        const { username, password, email } = userData;
        //Hash users password.
        const hashedPassword = hashSync(password, 10);

        //Deterime if the user already exists in the database based off of their username.
        User.exists({ username: username }, async function (error, result)
        {
            if (error) reject(error);

            //If the user doesn't already exist, begin allocation.
            if (!result)
            {

                //Fetch all questions from each category.
                const xssQuestions = await retrieveQuestions("XSS");
                const sqlQuestions = await retrieveQuestions("SQL");
                const ssrfQuestions = await retrieveQuestions("SSRF");

                //Extract and build unlock objects from each question.
                const xssUnlocks = extractQuestionUnlocks(xssQuestions);
                const sqlUnlocks = extractQuestionUnlocks(sqlQuestions);
                const ssrfUnlocks = extractQuestionUnlocks(ssrfQuestions);

                //Construct user object based on pre-defined MongoDB schema.
                const createdUser = User({
                    username: username,
                    password: hashedPassword,
                    email: email,
                    isAdmin: false,
                    unlocks: {
                        xss: xssUnlocks,
                        sql: sqlUnlocks,
                        ssrf: ssrfUnlocks
                    }
                });

                //Add constructed user object to MongoDB database.
                createdUser.save().then(data => console.log(`Successfully allocated user to the database! \n${ data }`)).catch(console.error);
                resolve(true);
            } else
            {
                console.log("ERROR: [REGISTER], that user already exists!");
                resolve(false);
            }
        });
    });

}

async function retrieveUsers()
{
    //Retrieve all users in the database.
    const users = await User.find({});
    return users;
}

async function retrieveUser(username)
{
    const user = await User.find({ username: username });
    return user;
}

async function retrieveUserByID(userID)
{
    const user = await User.find({ _id: userID });
    return user;
}

function getUserModel()
{
    return User;
}

function comparePassword(string, encryptedString)
{
    //Functionality used to compare normal password to hashed password. (bcrypt module)
    return compareSync(string, encryptedString);
}

async function updateUserUnlocks(username, unlocks)
{
    const {xss, sql, ssrf} = unlocks;
    await User.updateOne({ username: username }, { unlocks: { xss: xss, sql: sql, ssrf: ssrf } });
}


module.exports = {
    addUser: addUser,
    retrieveUsers: retrieveUsers,
    retrieveUser: retrieveUser,
    retrieveUserByID: retrieveUserByID,
    getUserModel: getUserModel,
    comparePassword: comparePassword,
    updateUserUnlocks: updateUserUnlocks
}