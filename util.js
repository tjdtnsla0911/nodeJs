console.log(`util.js에왔습니다`);
var util = {};

util.parseError =  function(errors){
 console.log(`function parseError에왔습니다 errors = ${errors}`);
  var parsed = {};
  if(errors.name == 'ValidationError'){
   console.log(`if errors.name == 'validationError에왔습니다'`);
    for(var name in errors.errors){
      var validationError = errors.errors[name]; //아까터진이유 V를 대문자로적움
      console.log(`function parseError의 for문안의 ValidationError = ${validationError}`);
      parsed[name] = { message:validationError.message };
    }
  }else if(errors.code =='11000'&& errors.errmsg.indexOf('username') > 0){
   console.log(`else if(errors.code =='11000'&& errors.errmsg.indexOf('username') > 0) 에옴`);
   console.log(`errors.code = ${errors.code}`);
   console.log(`errors.errmsg.indexOf('username') = ${errors.errmsg.indexOf('username')}`);
     parsed.username = { message:'This username already exists!'};
  }else{
   console.log(`else에옴 여긴 errors.name == 'ValidationError 인데 else임'`);
    parsed.unhandled = JSON.stringify(errors);
  }
 console.log(`리턴직전 parsed = ${parsed}`);
  return parsed;
}
console.log(`util.parseError = ${util.parseError}`);
util.isLoggedin = function(req,res,next){
  //사용자가 로그인되었는지 아닌지를 판단하고 로그인안됬으면
  //Please login first를 와 함 로그인 페이지로 보내는함수
console.log(`util.js의 util.isLoggedin에 왔습니다,`);
  if(req.isAuthenticated()){
    console.log(`util.js의 if req.isAuthenticated에왔습니다 그후 next()`);
    next();
  }else{
    console.log(`util.js의 else에옴 아마 여기가 로그인 안됫을떄일듯`);
    req.flash('errors',{login:'Please login first'});
    console.log(`util.js의 else 그후 redirect /login 직전`);
    res.redirect('/login');
  }
}

util.noPermission =function(req,res){

  //route에 접근권한이 없다고 판단된경우 호출되어
  //Tou dont머시기와 함꼐 로그인페이지로 보내는함/
  //next() (콜백)ㅇ,ㄹ 안하는이유는 상황에따라 판단방법이 다라서

  console.log(`util.js의 util.noPermission에 왔습니다`);
  req.flash('errors',{login:"YOU don't have permission"});
  req.logout();
  console.log(`util.js의 redirect /login직전`);
  req.redirect('/login');
}
//util.getPostQueryString함수는 res.locals에 getPostQueryString함수를
//미들웨어입니다
util.getPostQueryString  = function(req,res,next){
  console.log(`util.js의 util.getPoastQuery에 왔습니다`);
  res.locals.getPostQueryString = function(isAppended=false,overwrites={}){
  console.log(`util.getPostQuery안의 res.locals.getPostQueryString에옴`);
  console.log(`util.getPostQuery안의 res.locals.getPostQueryString의 req.query.page=${req.query.page}`);
  console.log(`util.getPostQuery안의 overwrites=${overwrites}`);
    var queryString = '';
    var queryArray = [];
    var page = overwrites.page?overwrites.page:(req.query.page?req.query.page:'');
    console.log(`util.getPostQuery안의 page = ${page}`);
    var limit = overwrites.limit?overwrites.limit:(req.query.limit?req.query.limit:'');
    var searchType = overwrites.searchType?overwrites.searchType:(req.query.searchType?req.query.searchType:''); // 1
    console.log(`overwrites.searchType = ${overwrites.searchType}`);
    console.log(`req.query.searchType = ${req.query.searchType}`);
    console.log(`searchType = ${searchType}`);
    var searchText = overwrites.searchText?overwrites.searchText:(req.query.searchText?req.query.searchText:''); // 1
    console.log(`overwrites.searchText = ${overwrites.searchText}`);
    console.log(`req.query.searchText = ${req.query.searchText}`);
    console.log(`serchText  = ${searchText}`);
    //페이지 기능과 마찬가지로 검색에 관련된 query string들이 게시물과 관련된 route들에서 계속 따라다닐 수 있도록 getPostQueryString 함수에 searchType과 searchText를 추가해줍니다.
    console.log(`util.getPostQuery안의 limit =${limit}`);
    if(page){
      console.log(`util.getPostQuery안의 page =${page}`);
      queryArray.push('page='+page);
    }
    if(limit){
      console.log(`util.getPostQuery안의 limit =${limit}`);
      queryArray.push('limit='+limit);
    }
    if(searchType){
      console.log(`if문의 searchType에왓습니다. `);
      queryArray.push('searchType='+searchType);
    }
    if(searchText){
      console.log(`if문의 searchText에 왔습니다`);
      queryArray.push('searchText='+searchText);
    }
    if(queryArray.length >0){
        console.log(`util.getPostQuery안의 queryArray.length =${queryArray.length}`);
      queryString = (isAppended?'&':'?') + queryArray.join('&');
    }
    console.log(`util.getPostQuery의 return 직전`);
    return queryString;
  }
  next();
}

module.exports = util;
