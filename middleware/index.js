var middlewareObj = {};
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'Please login first')
    res.redirect("/login");

}
middlewareObj.isAdmin = function(req, res, next){
    if(req.isAuthenticated()){
        if(req.user.role == 'admin'){
            return next();
        }
        return res.redirect('/404')
    }
    req.flash('error', 'Please login first')
    res.redirect("/login");

}


module.exports = middlewareObj