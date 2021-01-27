console.log(`index.js의 맨위`);
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override'); //put과 delete쓰기위해서
const session = require('express-session');//세션관리
const flash = require('connect-flash');//다른페이지에서 에러메시지보내야할//
//connect-flash와 session은 node.js에 모듈이어서 미들웨어를 꼭 선언해야함
const passport = require('./config/passport');
var util = require('./util')//
var app = express();

// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
//mongoose.connect(process.env.MONGO_DB);
mongoose.connect('당신의 몽고디비의 커넥터를 적으세요!'); // 2
var db = mongoose.connection;
db.once('open', function() {
  console.log('DB connected');
});
db.on('error', function(err) {
  console.log('DB ERROR : ', err);
});

// Other settings
app.set('view engine', 'ejs'); //ejs사용하게하는놈
app.use(express.static(__dirname + '/public'));// 정적파일제공
app.use(bodyParser.json()); //body-paerser가없으면 undefined가 뜰수도있음
app.use(bodyParser.urlencoded({
  extended: true
}));
//bodyParser.urlencoded() 를 등록하면 자동으로 req.body에 추가되고저장되]ㄴ다한다, 객체안에 객체를 파싱하게 할려면 true
app.use(methodOverride('_method'));

app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));; //3

app.use(passport.initialize());//passport를 초기화 시켜주는 함수,
app.use(passport.session());//passport.session()는 passport를 session과 연결해 주는 함수로 둘다 반드시 필요합니다
console.log()
app.use(flash()); //2 flash를 초기화함, 이제부터 req.flash를 사용가능
//req.flash(문자열,저장할_값)의 형태로 저장할_값(숫자,문자열,오브젝트등 어떠한값이라도 가능)
//을 해당 문자열에 저장, 이떄 flash는 배열로 저장되기때문에 같은문자열을 중복해서 사용하면
//순서대로 배열에 저장된다.
//req.flash(문자열)인 경우는 해당문자열 저장된 값들을 배열로 불러옴,저장된값이없으면 빈배열 []을 return
//passport

// Custom Middlewares // 3
app.use(function(req,res,next){//app.use에있는함수는 req가 오면 무조껀실행되고 반드시 router위에잇어야함
  console.log(`app.use 미들웨어에옴`);
  //req.isAuthenticated 는 passport에서 제공하는함수로 로그인됬는지안됬는지를 갈켜주는거라함
  //로그인됬으면 true 안됬으면 false반환하는
  res.locals.isAuthenticated = req.isAuthenticated();
  console.log(`req.isAuthenticated() = ${req.isAuthenticated
  ()}`); //안됫을떄 펄스
  console.log(`res.locals.isAuthenticated = ${res.locals.isAuthenticated}`); //로그인안했을땐 false
  console.log(`req.user = ${req.user}`); //로그인안할시 언디파인드
  res.locals.currentUser = req.user;//res.locals.isAuthenticated는 ejs에서 user가 로그인이 되어 있는지 아닌지를 확인하는데 사용되고, res.locals.currentUser는 로그인된 user의 정보를 불러오는데 사용됩니다.
  console.log(`next()전`);
  //req.user는 passport에서 추가하는 항목으로 로그인이 되면 session으로 부터 user를 deserialize하여 생성됩니다.
  next();
});

//Routers


console.log(`index.js의 /들어가기전`);
app.use('/', require('./routes/home'));
app.use('/posts',util.getPostQueryString,require('./routes/posts'));
//util.getPostQueryString미들웨어를 posts route이 request되기 전에 배치하여 모든 post routes에서 res.locals.getPostQueryString를 사용할 수 있게 하였습니다.
// app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users')); //1
var port = 3000;
app.listen(port, () => {
  console.log('server on! http://localhost:' + port);
});
