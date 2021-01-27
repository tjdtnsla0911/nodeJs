const express = require('express');
const router = express.Router();
const passport = require('../config/passport'); //1
console.log(`home.js에옴`);
//home
router.get('/', (req, res) => {
  console.log('home의 /에옴');
  res.render('home/welcome');
});

router.get('/about', (req, res) => {
  console.log('home의 /about에옴');
  res.render('home/about');
});

//Login //2
//login view를 보여주는 route입니다.

//user 생성시에 에러가 있는 경우 new페이지에 에러와 기존에 입력했던 값들을 보여주게 되는데, 이 값들은 create route에서 생성된 flash로부터 받아옵니다. flash는 array가 오게 되는데 이 프로그램에서는 하나 이상의 값이 저장되는 경우가 없고, 있더라도 오류이므로 무조건 [0]의 값을 읽어 오게 했습니다. 값이 없다면(처음 new페이지에 들어온 경우)에는 || {}를 사용해서 빈 오브젝트를 넣어 user/new페이지를 생성합니다.
router.get('/login', function(req, res) {
  console.log(`home.js의 /login에 왔습니다`);
  var username = req.flash('username')[0]; //처음로그인했을땐 언디파인드
  console.log(`home.js의 /login의 username =${username}`);
  var errors = req.flash('error')[0] || {};
  console.log(`home.js의 /login의 errors = ${errors} | 그후 res.render('home/login')`);
  res.render('home/login', {
    username: username,
    errors: errors
  });
});

//Post Login //3
router.post('/login',
  function(req, res, next) {
    //req.body안에 내가적은 username이랑 password가 그대로 받아온다.
    console.log(`router.home.js의 /login의 함수안`);
    var errors = {};
    var isValid = true;
    console.log(`router.home.js의 /login의 함수안의 req.body.username = ${req.body.username}`);

        console.log(`router.home.js의 /login의 함수안의 req.body.password = ${req.body.password}`);
          console.log(`router.home.js의 /login의 함수안의 req.body = ${req.body}`);
    if (!req.body.username) {
      console.log(`router.home.js의 /login의 함수안의 if (!req.body.username)에옴`);
      console.log(`req.body.username =${req.body.username}`);
      isValid = false;
      errors.username = 'Username is required';
    }
    if (!req.body.password) {
      console.log(`router.home.js의 /login의 함수안의 if (!req.body.password)에옴`);
      console.log(`req.body.password = ${req.body.password}`);
      isValid = false;
      errors.password = 'Password is required';
    }
    //로그인할떄는 바로 일로 글고 당연히 isValid = true
    if (isValid) {
      console.log(`router.home.js의 /login의 함수안의 if(isValid) = ${isValid}`);
      next();
    } else {
            console.log(`
              router.home.js의 /login의 함수안의 else에옴`);
          console.log(`router.home.js의 /login의 함수안의 errors = ${errors}`);
      req.flash('errors', errors);
      req.redirect('/login');
    }
  },
  passport.authenticate('local-login', { //next()로 받아서 여기서 passport.js의 local-login으로 보냄
    successRedirect: '/posts',
    failureRedirect: '/login'
  })
);
//logout을 해주는 router입니다  req.logout함수를 이용해 로그아웃한다
router.get('/logout', function(req, res) {
  console.log(`home.js의 /logout에 왔습니다 이후 바로 req.logout()시작`);
  req.logout();
  console.log(`home.js의 /logout의 req.login()끝나고 res.redirect('/')직전`);
  res.redirect('/');
});
console.log(`home.js의 router직전`);
module.exports = router;
