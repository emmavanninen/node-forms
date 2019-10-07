const isLoggedIn = (req, res) => {
    console.log(req.route.path);
    console.log(req.originalUrl);
    console.log(req.session.user);
    


    if (req.originalUrl === '/users/register' && !req.session.user){
        res.render('register', {success_msg: false, error_msg: false})
    } else if (req.originalUrl === '/login' && !req.session.user){
        res.render('login', { success_msg: false, error_msg: false })
    } else {
        res.redirect('show-me-my-page')
    }
}


module.exports = isLoggedIn