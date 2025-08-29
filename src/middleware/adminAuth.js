const rateLimit = require('express-rate-limit');

const requireAdminAuth = (req, res, next) => {
    if (req.session && req.session.admin) {
        return next();
    } else {
        return res.redirect('/admin/login');
    }
};

const addAdminToLocals = (req, res, next) => {
    if (req.session && req.session.admin) {
        res.locals.admin = req.session.admin;
    } else {
        res.locals.admin = null;
    }
    next();
};

const rateLimitLogin = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});


module.exports = {
    requireAdminAuth,
    addAdminToLocals,
    rateLimitLogin
};
