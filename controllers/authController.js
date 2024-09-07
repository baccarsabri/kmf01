const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const dbClient = require('../config/db');
const crypto = require('crypto');
const transporter = require('../config/mail');

// Login Page
exports.loginPage = (req, res) => {
    res.render('index.html', { token: crypto.randomBytes(20).toString('hex') });
};

// Login Logic
exports.login = async (req, res) => {
    const { username, password } = req.body;
    const db = dbClient.getDb();

    if (!username || !password) return res.send('Please provide valid username and password');

    try {
        const account = await db.collection('accounts').findOne({ username });
        if (account && bcrypt.compareSync(password, account.password)) {
            req.session.account_loggedin = true;
            req.session.account_id = account._id;
            res.send('success');
        } else {
            res.send('Incorrect username/password');
        }
    } catch (err) {
        console.error(err);
        res.send('An error occurred');
    }
};

// Register Page
exports.registerPage = (req, res) => {
    res.render('register.html', { token: crypto.randomBytes(20).toString('hex') });
};

// Register Logic
exports.register = async (req, res) => {
    const { username, password, cpassword, email } = req.body;
    const db = dbClient.getDb();

    if (password !== cpassword) return res.send('Passwords do not match!');
    if (!username || !email) return res.send('Please complete the form!');

    try {
        const existingAccount = await db.collection('accounts').findOne({ $or: [{ username }, { email }] });
        if (existingAccount) {
            return res.send('Account already exists!');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newAccount = { username, password: hashedPassword, email };

        await db.collection('accounts').insertOne(newAccount);
        res.send('Registered successfully! You can now login.');
    } catch (err) {
        console.error(err);
        res.send('An error occurred');
    }
};

// Logout Logic
exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};
