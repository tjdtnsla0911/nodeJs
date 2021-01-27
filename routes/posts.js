const express = require('express');
const router = express.Router();
var Post = require('../models/Post');
var User = require('../models/User'); //1
//우리는 username으로 DB에서 user을 찾고 해당 user의 id를 author로
//post 찾는 방식으로 작성자를 검색합니다. user를 검색해야하니,
//user모델을 require해야한다.
var util = require('../util');
console.log(`posts.js에왔습니다.`);

//index
router.get('/', async function(req, res) { //1

  console.log(`routers/posts.js의 /에옴`);
  //await를 쓰기위해선 async를 반드시써야함
  console.log(`req.query = ${req.query}`);
  console.log(`req.query.page = ${req.query.page}`);
  console.log(`Math.max(1,3) = ${Math.max(1,3)}`);
  var page = Math.max(1, parseInt(req.query.page)); //2
  console.log(`page = ${page}`);
  //Query String으로 전달받은 page,limit를 req.query를 통해읽어옴
  //parseInt함수를 사용해 Quert String은 문자열 전달되기때문에
  //숫자가 아닐수 있고 정수(소수점이아님)을 읽어내기 위해 사용
  console.log(`req.query.limit = ${req.query.limit}`);
  var limit = Math.max(1, parseInt(req.query.limit)); //2
  console.log(`limit = ${limit}`);
  //Math.max함수를 쓴이유는 page,limit는 양수여야함 최소1이되어야함
  page = !isNaN(page) ? page : 1; //3
  console.log(`isNaN이후의 page = ${page}`);
  //여긴 정수로 변환할수없는값이 page,limit에 오는 기본값을 설정해준다
  //query String이 없는경우에도 사용
  //isNan은 매개변수가 숫자인지 검사하는것
  limit = !isNaN(limit) ? limit : 10 //3

  var skip = (page - 1) * limit; //4
  console.log(`skip = ${skip}`);
  //skip은 무시할 게시판의 수를 담는 변수
  // var maxPage = Math.ceil(count / limit); //6
  var maxPage = 0;
  console.log(`maxPage= ${maxPage}`);
  //전체게시물수 count / 한페이지당 표시되어야할 게시물수 limit
  //이걸로 maxPage로 만든것
  console.log(`isNaN이후의 limit = ${limit}`);
  console.log(`req.query = ${req.query}`);
  var searchQuery = await createSearchQuery(req.query); // 1
  console.log(`searchQuery = ${searchQuery}`);
  //1. 실제 게시물 검색은 Post.find(검색_쿼리_오브젝트)에 어떤 검색_쿼리_오브젝트가 들어가는지에 따라 결정됩니다. {title:"test title"}이라는 object가 들어가면 title이 정확히 "test title"인 게시물이 검색되고, {body:"test body"}라는 object가 들어가면 body가 정확히 "test body"인 게시물이 검색됩니다. 이처럼 검색기능에서는 검색_쿼리_오브젝트를 만드는 것이 중요한데, 이것을 만들기 위해 createSearchQuery함수를 만들고 이 함수를 통해 생성된 검색_쿼리_오브젝트를 searchQuery 변수에 담았습니다.

  // 해당 함수의 코드는 4번에서 살펴보고, 여기서는 해당 함수를 통해 생성된 검색_쿼리_오브젝트를 searchQuery 변수에 넣었습니다.
  var posts = [];

  if (searchQuery) {
    console.log(`posts.js의 index 안의 if(searchQuery에 왔습니다)`);
    var count = await Post.countDocuments(searchQuery); //5
    //해당 검색_쿼리_오브젝트를 사용해서 전체 게시물수와 게시물을 구한다.
    console.log(`count = ${count}`);
    //Post.countDocuments({})함수를 사용해서 {}에 해당하는
    //({} == 조건이 없음, 즉 모든) post의 수를 DB에서 읽어 온 후 count변수에 담았습니다.
    //Promise앞에 await키워드를 사용하면 , 해당 Promise가 완료될때까지
    //다음 코드로 진행하지않고 기다렸다가 해당
    //Promise가 완료되면 resolve된 값을 return 합니다.
    maxPage = Math.ceil(count/limit);
    console.log(`maxPage = ${maxPage}`);
    posts = await Post.find(searchQuery) //7
      //기존의 Post.fine({})도 await를 사용해 검색된 posts를 바로 변수//
      //담게하였습니다.
      .populate('author')
      .sort('-createdAt')
      .skip(skip) //8 일정한수만큼 검색된 결과를 무시하는함수
      .limit(limit) //8 //일정한 수만큼 검색된 결과를 보여주는함
      .exec();

    console.log(`posts =${posts}`);
  }
  res.render('posts/index', {
    posts: posts,
    currentPage: page, //9 현재페이지번호
    maxPage: maxPage, //9 마지막페이지번호
    limit: limit, //9 페이지당 보여줘야 게시물수
    searchType: req.query.searchType, //2
    searchText: req.query.searchText //2
    //View에서 검색 form에 현재 검색에 사용한 검색타입과 검색어를
    //보여줄수있게 해당 데이터를 보냄
  });
});

//Index
//페이징전
// router.get('/', (req, res) => { //여기서다꺼내옴
//   console.log(`index의 /에 왔습니다.`);
//   Post.find({})
//     .populate('author') //. Model.populate()함수는 relationship이 형성되어 있는 항목의 값을 생성해 줍니다. 현재 post의 author에는 user의 id가 기록되어 있는데, 이 값을 바탕으로 실제 user의 값을 author에 생성하게 됩니다.
//     .sort('-createAt')
//     .exec((err, posts) => {
//       console.log(`posts =${posts}`);
//       if (err) {
//         return res.json(err);
//       }
//       console.log(`index의 /의 render 직전`);
//       res.render('posts/index', {
//         posts: posts
//       });
//     });
// });

//New
router.get('/new', util.isLoggedin, (req, res) => {
  console.log('posts.js의 /new에옴');
  var post = req.flash('post')[0] || {};
  var errors = req.flash('errors')[0] || {};
  console.log(`posts.js의 /new의 post = ${post}`);
  console.log(`posts.js의 /new의 errors = ${errors}`);
  console.log(`posts.js의 /new의 render 직전`);
  res.render('posts/new', {
    post: post,
    errors: errors
  });
});

//create
router.post('/', util.isLoggedin, (req, res) => {
  console.log('/ 왔습니다.');
  req.body.author = req.user._id; //2
  console.log(`req.body.author = ${req.body.author}`);
  //2. 글을 작성할때는 req.user._id를 가져와서 post의 author에 기록합니다.
  //(req.user는 로그인을 하면 passport에서 자동으로 생성해 줍니다.. 기억하죠?)

  Post.create(req.body, (err, post) => {
    console.log(`req.body =${req.body}`);
    console.log(`post = ${post}`);
    if (err) {
      console.log(`posts.js의 /의(post)의 err에왔습니다`);
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/new' + res.locals.getPostQueryString()); //1
      //post의 routes에 redirect가 있는경우
      //res.locals.getPostQueryString함수를 사용해서/
      //query String을 계속유지해야함
      //여기서 생성되는 query String은 기존 query String에 추가되는게아니고
      //(isAppended = false),값을 overwrite하지도 않으므로 파라메터 전달없이
      //res.locals.getPostQueryString()을 호출한다.
      //  return req.redirect('/posts/new')
    }
    console.log(`posts.js의 /의(post)의 redirect직전 /posts로감`);
    res.redirect('/posts' + res.locals.getPostQueryString(false, {
      page: 1,
      searchText: ''
    })); //3

    //새글작성후에는 무조껀 page를 보여주도록 page
    //res.redirect(`/posts`);
    //새 글을 작성한 후에는 무조껀 첫번째 page를 보여주도록 page query를 1로 overwrtie
    //새글을 작성하면 검색 결과를 query String에서 제거해서 전체 게시물이 보이도록한다.
  });
});

//show
router.get('/:id', (req, res) => {
  console.log('/:id에 왓습니다.');
  Post.findOne({
      _id: req.params.id
    })
    .populate('author')
    .exec(function(err, post) {
      console.log(`post = ${post}`);
      console.log(`id = ${req.params.id}`);
      if (err) {
        return req.json(err);
      }
      console.log(`렌더직전`);
      res.render('posts/show', {
        post: post
      });
    });
});


//edit
router.get('/:id/edit', util.isLoggedin, (req, res) => {
  console.log('/:id/edit에 왔습니다.');
  var post = req.flash('post')[0];
  var errors = req.flash('errors')[0] || {};
  console.log(`/:id/edit의 post = ${post}`);
  console.log(`/:id/edit의 errors = ${errors}`);
  if (!post) {
    console.log('/:id/edit의 if문 !post에 왔습니다.');
    Post.findOne({
      _id: req.params.id
    }, (err, post) => {
      console.log(`Post.findOne에 왔습니다 id=${req.params.id}`);
      console.log(`post =${post}`);
      if (err) {
        console.log(`/:id/edit의 !post의 if err = ${err}.`);
        return req.json(err);
      }
      res.render('posts/edit', {
        post: post
      });

    })
  } else {
    console.log(`/:id/edit의 !post의 else에 왔습니다`);
    console.log(`/:id/edit의 !post의 else의 req.params.id = ${req.params.id}`);
    post._id = req.params.id;
    console.log(`posts/edit render 직전`);
    res.render('posts/edit', {
      post: post,
      errors: errors
    });
  }
});
//updated
router.put('/:id', util.isLoggedin, function(req, res) {
  console.log('posts.js의 update /:id put 에옴');
  req.body.updateAt = Date.now();
  console.log(`posts.js의 req.body.updateAt =${req.body.updateAt}`);
  Post.findOneAndUpdate({
      _id: req.params.id
    },
    req.body, {
      runValidators: true
    },
    function(err, post) {
      console.log(`posts.js의 update /:id put post = ${post}`);
      if (err) {
        console.log(`posts.js의 update /:id put의 if에와서 err = ${err}`);
        req.flash('post', req.body);
        console.log(`posts.js의 update /:id put의 req.body =${req.body}`);
        req.flash('errors', util.parseError(err));
        console.log(`posts.js의 update /:id put의 return 직전`);
        return res.redirect('/posts/' + req.params.id + '/edit' + req.locals.getPostQueryString());
        // return res.redirect('/posts/' + req.params.id + '/edit');
      }
      res.redirect('/posts/' + req.params.id + req.locals.getPostQueryString()); //1
      // res.redirect('/posts/' + req.params.id);
    });
});


//update
// router.put('/:id', (req, res) => {
//   console.log(`/:id에 왔습니다.`);
//   req.body.updatedAt = Date.now(); //2
//   Post.findOneAndUpdate({_id: req.params.id
//   }, (err, post) => {
//     console.log(`Post.findOneAndUpdate에 왔습니다.`);
//     console.log(`req.params.id =${req.params.id}`);
//     if (err) {
//       return req.json(err);
//     }
//     res.redirect('/posts/' + req.params.id);
//   });
// });

//destory
router.delete('/:id', util.isLoggedin, function(req, res) {
  console.log(`posts.js의 /:id에왔습니다`);
  Post.deleteOne({
    _id: req.params.id
  }, function(err) {

    console.log(`posts.js의 /:id의 Post.deleteOne 에왔습니다`);
    if (err) {
      console.log(`posts.js의 /:id의 Post.deleteOne의 if err에왔습니다 err =${err}`);
      return res.json(err)
    };
    console.log(`posts.js의 /:id의 Post.deleteOne의 redirect직전 가는곳은 /posts`);
    res.redirect('/posts/' + res.locals.getPostQueryString());
    // res.redirect('/posts');
  });
});
router.delete('/:id', util.isLoggedin, (req, res) => {
  console.log(`delete에 왔습니다.`);
  Post.deleteOne({
    _id: req.params.id
  }, function(err) {
    console.log(`PostdeleteOne에왔습니다.`);
    console.log(`req.params.id = ${req.params.id}`);
    if (err) {
      return req.json(err);
    }
    req.redirect('/posts');
  });
});

module.exports = router;

function checkPermission(req, res, next) {
  console.log(`posts.js의 checkPermission에 왔습니다.`);
  Post.findOne({
    _id: req.params.id
  }, function(err, post) {
    console.log(`postsjs의 checkPermission의 Post.findOne에 왔고
      req.params.id = ${req.params.id}`);
    if (err) {
      console.log(`posts.js의 if err에옴 err =${err}`);
      return res.json(err);
    }
    if (post.author != req.user.id) {
      console.log(`posts.js의 if post.author != req.user.id 에옴`);
      console.log(`posts.js의 if post.author != req.user.id 의
        post.author = ${post.author} `);
      console.log(`posts.js의 if post.author != req.user.index의
          req.user.id = ${req.user.id}`);
      return util.noPermission(req, res);
    }
    console.log(`posts.js의 next 직전`);
    next();
  });
}

async function createSearchQuery(queries){
  var searchQuery = {};
  if(queries.searchType && queries.searchText && queries.searchText.length >= 3){
    var searchTypes = queries.searchType.toLowerCase().split(',');
    var postQueries = [];
    if(searchTypes.indexOf('title')>=0){
      postQueries.push({ title: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if(searchTypes.indexOf('body')>=0){
      postQueries.push({ body: { $regex: new RegExp(queries.searchText, 'i') } });
    }
    if(searchTypes.indexOf('author!')>=0){
      var user = await User.findOne({ username: queries.searchText }).exec();
      if(user) postQueries.push({author:user._id});
    }
    else if(searchTypes.indexOf('author')>=0){
      var users = await User.find({ username: { $regex: new RegExp(queries.searchText, 'i') } }).exec();
      var userIds = [];
      for(var user of users){
        userIds.push(user._id);
      }
      if(userIds.length>0) postQueries.push({author:{$in:userIds}});
    }
    if(postQueries.length>0) searchQuery = {$or:postQueries};
    else searchQuery = null;
  }
  return searchQuery;
}

// async function createSearchQuery(queries) { //4
//   console.log(`async createSearchQuery에옴 `);
//   console.log(`async createSearchQuery의 searchTypes =${searchTypes}`);
//   var searchQuery = {};
//   if (queries.searchType && queries.searchText && queries.searchText.length >= 3) {
//     //query에서 searchTpye
//     var searchTypes = queries.searchType.toLowerCase().split(',');
//     var postQueries = [];
//
//     if (searchTypes.indexOf('title') >= 0) {
//       postQueries.push({
//         title: {
//           $regex: new RegExp(queries.searchText, 'i')
//         }
//       }); //2
//       //{$regex.Regex_}를 사용해서 reqex검색을  할수잇습니다.
//       //i는 대소문자 구별하지않는다는 regex의 오션입니다.
//     }
//     if (searchTypes.indexOf('body') >= 0) {
//       postQueries.push({
//         body: {
//           $regex: new RegExp(queries.searchText, 'i')
//         }
//       });
//     }
//
//     if (postQueries.length > 0) {
//       searchQuery = {
//         $or: postQueries
//       }; //3
//       //{$of:검색_쿼리_오브젝트_배열}을 사용해서 or 검색을 할수 있습니다.
//     }
//   }
//   if(searchTypes.indexOf('author!')>=0){ // 2-1
//     console.log(`indexOf 'author!에옴 '`);
//      var user = await User.findOne({ username: queries.searchText }).exec();
//      if(user) postQueries.push({author:user._id});
//    }
//    else if(searchTypes.indexOf('author')>=0){ // 2-2
//          console.log(`indexOf 'author에옴 '`);
//      var users = await User.find({ username: { $regex: new RegExp(queries.searchText, 'i') } }).exec();
//      var userIds = [];
//      for(var user of users){
//        userIds.push(user._id);
//      }
//      if(userIds.length>0) postQueries.push({author:{$in:userIds}});
//    }
//    if(postQueries.length>0) searchQuery = {$or:postQueries}; // 2-3
//    else searchQuery = null;
//
//   return searchQuery;
// }
