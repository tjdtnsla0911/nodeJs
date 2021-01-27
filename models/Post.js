const mongoose = require('mongoose');
console.log('/Post에옴 (models)');
var postSchema = mongoose.Schema({ // 1
  title:{type:String, required:[true,'Title is required!']}, // 1 커스텀 에러메세지 추가
   body:{type:String, required:[true,'Body is required!']},   // 1
    author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true}, // 1
    //1. post schema에 author를 추가해 줍니다. 또한 ref:'user'를 통해 이 항목의 데이터가 user collection의 id와 연결됨을 mongoose에 알립니다. 이렇게 하여 user의 user.id와 post의 post.author가 연결되어 user와 post의 relationship이 형성되었습니다.
  createdAt:{type:Date, default:Date.now}, // 2
  updatedAt:{type:Date},
});
console.log(`models/Post.js의 postSchema = ${postSchema}`);

const Post = mongoose.model('post',postSchema);
module.exports = Post;
