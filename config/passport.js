console.log(`passport.js에왔습니다.`);
//passport는 내장 session이 있기때문에 무조껀 session뒤에 있어야한다.
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; //1
//Strategy은 대부분 require 다음 . Strategt가 붙음
//꼭붙여야한다는거는  https://www.npmjs.com <--여기서확인바람
var User = require('../models/User');

// serialize & deserialize User // 2
//passport.serializeUser함수는 login시 DB에서 발견한 user를 어떻게 session에 저장할지
//정하는부분이다. user정보 전체를 session에 저장할수도있지만 session에 저장되는
//정보가 너무많아지면 사이트의 성능이 떨어질수도있 회원정보수정을 통해 user Object가
//변경되더라도 이미 전체 user정보가 session에 저장되있으므로
//해당부분을 변경해 주어야하는 등의 문제가 있으 /로
//user의 id만 session에저장한다.
passport.serializeUser(function(user, done) {
  console.log(`passport.serializeUser(function(user,done)에 옴`);
  console.log(`passport.serializeUser(function(user,done)의 user.id= ${user.id}`);
  console.log(`passport.serializeUser(function(user,done)의 user= ${user}`);
  //user안에는 _id랑 password(해쉬된거)랑 id가 있음
  console.log(`passport.serializeUser(function(user,done)의 done(넣기직전) =${done}`);
  done(null, user.id);
});
//passport.deserializeUser함수는 request시에 session에서 어떻게 user object를 만들지를 정하는 부분입니다. 매번 request마다 user정보를 db에서 새로 읽어오는데, user가 변경되면 바로 변경된 정보가 반영되는 장점이 있습니다. 다만 매번 request마다 db에서 user를 읽어와야 하는 단점이 있습니다. user정보를 전부 session에 저장하여 db접촉을 줄이거나, 아니면 request마다 user를 db에서 읽어와서 데이터의 일관성을 확보하거나 자신의 상황에 맞게 선택하시면 됩니다.
passport.deserializeUser(function(id, done) { //여기서 낚아채는건가?
  console.log(`passport.deserializeUser(function(id,done)에 왔습니다`);
  console.log(`passport.deserializeUser(function(id,done)의 id= ${id}`);//아이디그대로받음
  console.log(`passport.deserializeUser(function(id,done)  =${done}`);
  User.findOne({
    _id: id
  }, function(err, user) {
    console.log(`passport.deserializeUser(function(id,done)의 User.findeone에옴`);
    console.log(`passport.deserializeUser(function(id,done)의 User.findeone의 user =${user}, id=${id}`);
    done(err, user); //new 누를땐 app.use 미들웨어로감
  });
});

// local strategy 를 설정하는부분
//3-1. 만약 로그인 form의 username과 password항목의 이름이 다르다면 여기에서 값을 변경해 주면 됩니다. 사실 이 코드에서는 해당 항목 이름이 form과 일치하기 때문에 굳이 쓰지 않아도 됩니다. 예를들어 로그인 form의 항목이름이 email, pass라면 usernameField : "email", passwordField : "pass"로 해야 합니다
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'username', //3-1
      passwordField : 'password', // 3-1
      passReqToCallback : true ////인증을 수행하는 인증 함수로 HTTP request를 그대로  전달할지 여부를 결정한다
  },function(req,username,password,done){ //3-2
    console.log(`passport.js local-login에 왔습니다.`);
    console.log(`passport.js local-login의 username =${username}.`);
    console.log(`passport.js local-login의 password = ${password}.`);
    console.log(`done  =${done}`);
    User.findOne({username:username})
    .select({password:1})
    //password:1을 하는이유는 User.js에 select:false로 되있고 저렇게 1로설정하여 필요하면 읽어오고
    //안필요하면 읽어오지말라는뜻인듯, {password:0}이면 해당비번을 가져오지말라는 뜻인듯
    .exec(function(err,user){ //exec함수안에 DB에서 데이터를 찾아서 어케하는듯 쿼리출력땜시쓰는건가?
      if(err){
        console.log(`passport.js의 passport.use('local-login')의 err에 왔습니다 err= ${err}`);
        return done(err);
      }
      if(user && user.authenticate(password)){  //일치할경우인가? 3-3  user.authenticate(password)는 입력받은 password와 db에서 읽어온 해당 user의 password hash를 비교하는 함수로 게시판 - 계정 비밀번호 암호화(bcrypt) 강의에서 bcrypt로 만든 함수입니다.
        console.log(`(user && user.authenticate(password)에 왔습니다`);
        console.log(`(user && user.authenticate(password)의 user = ${user}`); //_id,password,id가 들어가있음
        console.log(`(user && user.authenticate(password)의 user.authenticate(password) = ${user.authenticate(password)}`); //true
        console.log(`return done 직전`);
        return done(null,user); //done함수의 첫번째파라메터는 error를 담기위한건데
        //없으면 null쳐넣어라 그리고나서 passport.serializeUser로감
      }else{
        console.log(`passport.js의 passport.use('local-login')의 else에 왔습니다`);
        console.log(`passport.js의 passport.use('local-login')의 else의 username =${username}`);

        req.flash('username',username);
        req.flash('error',{login:'The username or password is incorrect.'});
        console.log(`passport.js의 passport.use('local-login')의 else의 done직전`);
        return done(null,false);
        //done함수의 첫번째 parameter는 항상 error를 담기 위한 것으로 error가 없다면 null을 담습니다.
      }
    });
  })
);

module.exports = passport;
