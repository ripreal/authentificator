
const express = require('express');
const router = express.Router();
const UserService = require('../repo/userService');

// GET //
router.get('/', (req, res, next) => {
    let msg = 'working USERS table=' + process.env.USERS_TABLE + ' profile=' + process.env.APP_PROFILE + ' port=' + process.env.PORT + ' region=' + process.env.REGION;
    res.sendFile('public/index.html', { root: '.' });
});

router.post('/register', async (req, res, next) => {

    let isValid = ((req.body.email 
        && req.body.username
        && req.body.password 
        && req.body.passwordconf) != undefined);

    if (isValid && req.body.password !== req.body.passwordconf) {
        let err = new Error('Passwords do not match.');
        err.status = 400;
        next(err);
    } else if (isValid) {

         let userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            passwordconf: req.body.passwordconf,
        }

        let userService = new UserService();
        try {
            let user = await userService.createUser(userData);
            return res.send("user registered!");
        } catch (error) {
            let err = new Error(error);
            err.status = 500;
            return next(err);
        }

    } else {
        let err = new Error("Not all body parameters were specified!");
        err.status = 400;
        return next(err);
    }
});

router.post('/login', async (req, res, next) => {
    if (req.body.email && req.body.password) {
        let userService = new UserService();
        try { 
            let user = await userService.authenticate(req.body.email, req.body.password);
            res.send({token: user.token});
        } catch(error) {
            let err = new Error(error);
            err.status = 500;
            return next(err);
        }
    } else {
        let err = new Error("Not all body parameters were specified!");
        err.status = 400;
        return next(err);
    }
});

router.delete('/login', async (req, res, next) => {
    if (req.body.email && req.body.password) {
        let userService = new UserService();
        try { 
            await userService.delete(req.body.email);
            res.send('User deleted!');
        } catch(error) {
            let err = new Error(error);
            err.status = 500;
            return next(err);
        }
    } else {
        let err = new Error("Not all body parameters were specified!");
        err.status = 400;
        return next(err);
    }
});

module.exports = router; 