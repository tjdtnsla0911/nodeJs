var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util')//1
console.log(`users.js의 User = ${User}`);
// Index // 1 지워둠
// router.get('/', function(req, res) {
//   console.log(`users.js의 /에옴`);
//   User.find({})
//     .sort({
//       username: 1
//     }) //username:1을해서 오름차순으로햇음,-1이면 내림차순
//     .exec(function(err, users) {
//       if (err) return res.json(err);
//       console.log(`users.js의 /의 users = ${users}`);
//       res.render('users/index', {
//         users: users
//       });
//     });
// });

// New
router.get('/new', function(req, res) {
  console.log(`users.js의 /new에옴`);
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  console.log(`/new의 user= ${user}`);
  console.log(`/new의 errors = ${errors}`);

  res.render('users/new', {
    user: user,
    errors: errors
  });
});

// create
router.post('/', function(req, res) {
  console.log(`users.js의 post /에옴 create인듯`);
  console.log(`req.body =${req.body}`);
  User.create(req.body, function(err, user) {
    console.log(`debugger직전`);

    console.log(`users.js의 post /의 req.body=${req.body}`);
    console.log(`users.js의 post /의 user=${user}`); //여기서 undefined뜨는데 그게문제인듯 근데아님
   //아마 위에는 실패해서 user에 undefined가 뜨는거일지도모름
    if (err) {
    //err에선 ㄹㅇ 내가 터트린 err저눕가 들어있는거같음
      console.log(`post / 의 err에옴 err =${err}`); //user.isModified is not a function
      console.log(`post / 의 err의 req.body =${req.body}`);
      console.log(`req.flash1차 들어가기전`);
      req.flash('user', req.body);
      console.log(`req.flash2차 들어가기전`);
      req.flash('errors', util.parseError(err)); //여기서 parserError호출시킴
      console.log(`users.js의 post /의 return 직전`);
      return res.redirect('/users/new');
    };
    console.log('User.create에서 /users 보내기직전');
    res.redirect('/users');
  });
});

// show
router.get('/:username', function(req, res) {
  console.log(`users.js의 /:username에옴`);
  User.findOne({
    username: req.params.username
  }, function(err, user) {
    if (err) return res.json(err);
    console.log(`users.js의 /:username의 user = ${user}`);
    res.render('users/show', {
      user: user
    });
  });
});

// edit
router.get('/:username/edit', function(req, res) {
  console.log(`users.js의 /:username/edit에옴`);
  var users = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if (!user) {
    console.log(`users.js의 /:username/edit의 !user(if)에옴`);
    User.findOne({
        username: req.params.username
      },
      function(err, user) {
        if (err) return res.json(err);
        console.log(`users.js의 /:username/edit의 user = ${user}`);
        console.log(`users.js의 /:username/edit {username:req.params.username} =${req.params.username}`);
        res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    });
  }else{
    console.log(`users.js의 /:username/edit의 !user(else)에옴`);
    res.render('users/edit',{username:req.params.username, user:user, errors:errors})
  }
});

// update // 2
router.put('/:username', function(req, res, next) {
  console.log(`users.js의 /:username에옴`);
  User.findOne({
      username: req.params.username
    }) // 2-1
    .select('password') // 2-2
    .exec(function(err, user) {
      console.log(`users.js의 /:username의 req.params.username= ${req.params.username}`);
      console.log(`users.js의 /:username의 user= ${user}`);

      if (err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword ? req.body.newPassword : user.password; // 2-3
      console.log(`users.js의 /:username의user.originalPassword=${user.originalPassword}`);
      console.log(`users.js의 /:username의  user.password=${user.password}`);
      console.log(`users.js의 /:username의  req.body=${req.body}`);

      for (var p in req.body) { // 2-4
        console.log(`users.js의 for문의 req.body[b]=${req.body[p]}`);
        user[p] = req.body[p];
      }
      // save updated user
      user.save(function(err, user) {
        console.log(`users.js의 /:username의 user.save의 user = ${user}`);
        if (err){
          console.log(`users.js의 /:username의 user.save의 if err에옴`);
          console.log(`users.js의 /:username의 user.save의 req.body =${req.body}`);
          console.log(`users.js의 /:username의 user.save의  err = ${err}`);
          console.log(`req.flash1차 들어가기전`);
          req.flash('user',req.body);
          console.log(`req.flash 2차 들어가기전`);
          req.flash('errors',parseError(err));
          console.log(`리다이렉트직전 req.params.username =${req.params.username}`);
           return res.redirect('/users/'+req.params.username+'/edit');
        }
        console.log(`users.js의 user.username =${user.username} `);
        res.redirect('/users/' + user.username);
      });
    });
});

// destroy
router.delete('/:username', function(req, res) {
  console.log(`users.js /:username(델레트)에옴`);
  User.deleteOne({
    username: req.params.username
  }, function(err) {
    console.log(`users.js /:username(델레트)에옴 req.params.username} =${req.params.username}`);
    if (err) return res.json(err);
    res.redirect('/users');
  });
});

module.exports = router;

function checkPermission(req,res,next){
  console.log(`users.js의 checkPermission에 왔습니다`);
  User.findOne({username:req.params.username},function(err,user){
  console.log(`users.js의 checkPermission의 User.findOne에 왔습니다`);
  console.log(`username : ${username}`);
    if(err){
        console.log(`users.js의 checkPermission의 if err에 왔습니다 err=${err}` );
      return res.json(err);
    }
    if(user.id!=req.user.id){
      console.log(`users.js의 checkPermission의 user.id != req.user.id 에 왔습니다`);
      console.log(`user,id =${user.id}`);
      console.log(`req.user.id =`,mreq.user.id);
      console.log(`return util.noPermission으로 리턴직전`);
      return util.noPermission(req.res);
    }
    console.log(`users.js의 checkPermission의 next직전 `);
    next();
  });
}


// function parseError(errors){
//   var parsed = {};
//   if(errors.name == 'ValidationError'){
//     for(var name in errors.errors){
//       var validationError = errors.errors[name];
//       parsed[name] = { message:validationError.message };
//     }
//   }
//   else if(errors.code == '11000' && errors.errmsg.indexOf('username') > 0) {
//     parsed.username = { message:'This username already exists!' };
//   }
//   else {
//     parsed.unhandled = JSON.stringify(errors);
//   }
//   return parsed;
// }


//에러났던거원
// function parseError(errors){
//   console.log(`function parseError에왔습니다 errors = ${errors}`);
//   var parsed = {};
//   if(errors.name == 'validationError'){
//     console.log(`if errors.name == 'validationError에왔습니다'`);
//     for(var name in errors.errors){
//       var ValidationError = errors.errors[name];
//       console.log(`function parseError의 for문안의 ValidationError = ${ValidationError}`);
//       parsed[name] = { message:validationError.message };
//     }
//   }else if(errors.code =='11000'&& errors.errmsg.indexOf('username') > 0){
//     console.log(`else if(errors.code =='11000'&& errors.errmsg.indexOf('username') > 0) 에옴`);
//     console.log(`errors.code = ${errors.code}`);
//     console.log(`errors.errmsg.indexOf('username') = ${errors.errmsg.indexOf('username')}`);
//      parsed.username = { message:'This username already exists!' };
//   }else{
//     console.log(`else에옴 여긴 errors.name == 'ValidationError 인데 else임'`);
//     parsed.unhandled = JSON.stringify(errors);
//   }
//   console.log(`리턴직전 parsed = ${parsed}`);
//   return parsed;
// }
