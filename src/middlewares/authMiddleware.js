function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        req.user = req.session.user;
        return next();
    }
    res.redirect('/');
};

export default isAuthenticated;
