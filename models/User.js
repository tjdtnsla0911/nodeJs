// models/User.js
//virtual 이란 collection에 정의 되지않은 filed지만 정의된
//filed처럼 사용할수있게하는놈
//디비에 저장할필요없는것들쓰기가능
console.log(`model의 User.js에왔습니다`);
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
console.log(`bcrypt = ${bcrypt}`);

// schema // 1
var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required!'],//required= 꼭입력
    match:[/^.{4,12}$/,'Should be 4-12 characters!'], // 1-2
    //regex 정규표현식들어가서 부적합한건 에러메세
    trim:true, //빈칸이 있을경우 빈칸제거
    unique: true//기본키같은느낌
  },
  password: {
    type: String,
    required: [true, 'Password is required!'],
    select: false
  },
  name: {
    type: String,
    required: [true, 'Name is required!'],
    match:[/^.{4,12}$/,'Should be 4-12 characters!'], // 1-2
    trim:true // 1-1
  },
  email: {
    type: String,
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'], // 1-3 여긴 이메일전용
    trim:true

  }
}, {
  toObject: {
    virtuals: true
  }
});
console.log(`Uesr.js의 userSchma = ${userSchema}`);

// virtuals // 2
userSchema.virtual('passwordConfirmation')//비번확인하는곳
  .get(function() {//2번실행
    console.log(`User.js passwordConfirmation의 this._passwordConfirmation = ${this._passwordConfirmation}`);
    return this._passwordConfirmation;
  })
  .set(function(value) { //set에서 1차적으로 받음 //1번실
    console.log(`User.js passwordConfirmation의 value = ${value}`);
    this._passwordConfirmation = value;
  });

userSchema.virtual('originalPassword')
  .get(function() {//3번실행 하지만 이땐 언디파인드
    console.log(`User.js userSchema.virtual('originalPassword')의 this. this._originalPassword =${ this._originalPassword}`);
    return this._originalPassword;
  })
  .set(function(value) {
    console.log(`User.js userSchema.virtual('originalPassword')의 value =${value}`);
    this._originalPassword = value;
  });

userSchema.virtual('currentPassword')
  .get(function() { //4번실행 근데 이때도 언디파인드
    console.log(`userSchema.virtual('currentPassword')의  this._currentPassword =${  this._currentPassword}`);

    return this._currentPassword;
  })
  .set(function(value) {
    console.log(`userSchema.virtual('currentPassword')의  value =${ value}`);
    this._currentPassword = value;
  });

userSchema.virtual('newPassword')
  .get(function() {//5번실행 이떄도 언디파인드
    console.log(`userSchema.virtual('newPassword')의  this._newPassword =${ this._newPassword}`);
    return this._newPassword;
  })
  .set(function(value) {
    console.log(`userSchema.virtual('newPassword')의  value =${value}`);
    this._newPassword = value;
  });
// password validation // 3
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/; // 2-1
console.log(`passwordRegex = ${passwordRegex}`);
//8~16자리 문자열중 숫자랑 영문자중 반드시 하나이 존재해야한다는 regex
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!'; // 2-2
//에러메세지를 선언한 변수
userSchema.path('password').validate(function(v) { //6번실행, 매개변수 v = 내가적은비번
console.log(`userSchema.path('password').validate(function(v)에옴`);
  //패스워드를 d에 생성,수정하기전에 값이유요한지 확인하는게 validate
  var user = this; // 3-1 validation callback 함수속의 tihs는 user modeml입니다.
  //tihs는 내가적은 모든것 + id
  console.log(`userSchema.virtual('password')의 this =${this}`);
  //v는 내가 적은 비번
  console.log(`userSchema.virtual('password')의 v =${v}`);
  // create user // 3-3
  if (user.isNew) { // 3-2
    //model.isNew 항목은 해당 모델이 생성되는경우에는 true고 아니면 false의 값을가짐
    //이항목을 이용해 현재 password validation이 회원가입인지 회원정보수정인지 알수있음
    console.log(`User.js의 user.isNew는(if문입니다 true) = ${user.isNew}`); //트루뜸
    if (!user.passwordConfirmation) {
      console.log(`!!user.passwordConfirmation에옴`);
      console.log(`User.js의 !user.passwordConfirmation에옴 user.passwordConfirmation = ${user.passwordConfirmation}`);
      user.invalidate('passwordConfirmation', 'Password Confirmation is required.');
    }

    console.log(`!passwordRegex.test(user.password) 들어가기직전`);
    if (!passwordRegex.test(user.password)) {
    //정규표현식.test(문자열)  = 문자열에 정규표현식을 통과하는부분이있따면
    //true, 없다면 false를밷음
      console.log(`!passwordRegex.test(user.password)에 왔습니다.`);
      console.log(`!passwordRegex.test(user.password)는 =${passwordRegex.test(user.password)}`);
      user.invalidate('password', passwordRegexErrorMessage);
      //위에서 false를 뱉으면 model.invalidate함수를 호출
    }else if(user.password !== user.passwordConfirmation){
      console.log(`user.password !== user.passwordConfirmation 에옴(elseif)`);
      console.log(`user.password = ${user.password}`);
      console.log(`user.passwordConfirmation`);
     user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
    console.log(`if끝남`);
  }

  // update user // 3-4
  if (!user.isNew) {
    console.log(`User.js의 !user.isNew에옴`);
    if (!user.currentPassword) {
      console.log(`!user.currentPassword에옴 user.currentPassword = ${user.currentPassword}`);
      user.invalidate('currentPassword', 'Current Password is required!');
    } else if (!bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
      console.log(`!bcrypt.compareSync(user.currentPassword, user.originalPassword에옴 user.currentPassword = ${user.currentPassword}`);
      console.log(`(!bcrypt.compareSync(user.currentPassword, user.originalPassword에옴 user.originalPassword = ${user.originalPassword}`);
      user.invalidate('currentPassword', 'Current Password is invalid!');
    }

      if(user.newPassword && !passwordRegex.test(user.newPassword)){ //2-3
        console.log(`!user.isNew안의 user.newPassword && !passwordRegex.test(user.newPassword에옴 if문`);
        console.log(`user.newPassword = ${user.newPassword}`);
        console.log(`passwordRegex.test(user.newPassword) = ${passwordRegex.test(user.newPassword)}`);
        user.invalidate("newPassword", passwordRegexErrorMessage); // 2-4

      }else if(user.newPassword !== user.passwordConfirmation) {
      console.log(`user.newPassword !== user.passwordConfirmation에옴 user.newPassword = ${user.newPassword}`);
      console.log(`user.newPassword !== user.passwordConfirmation에옴 user.passwordConfirmation = ${user.passwordConfirmation}`);
      user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
    }
  }
});

//hash password //3
userSchema.pre('save',function(next) { //여기서 화살표함수 쓰면 this고장나서 조 //6번실행
  console.log(`userSchma.pre에 왓습니다 next = ${next}`);
  var user = this;
    console.log(`userSchma.pre의 this=${this}`);//next는안직히고 여기가찍히는데 id까지해서 다들어가잇음 근데 이땐아직 hash안되있음
    //console.dir(`userSchma.pre의 user.isModified('password')= ${user.isModified('password')}`);
  if (!user.isModified('password')) { // 3-1
    consle.log(`(!user.isModified('password' 에옴`);
    return next();
  } else {
    console.log(`(!user.isModified('password)의 else에옴'`);
    //여기서 Hash함
    console.log(`else의 bcrypt.hashSync(user.password) = ${bcrypt.hashSync(user.password)}`);
    user.password = bcrypt.hashSync(user.password); //3-2
    return next();
  }
});

//model methods //4
//4. user model의 password hash와 입력받은 password text를 비교하는 method를 추가합니다. 이번 예제에 사용되는 method는 아니고 나중에 로그인을 만들때 될 method인데 bcrypt를 사용하므로 지금 추가해봤습니다.
userSchema.methods.authenticate = function (password) {
  console.log(`userjs의 serSchema.methods.authenticate = function (password)에오고 password=${password}`);//아직까진 sha256안됨
  var user = this;
  console.log(`이곳의 this  =${this}`); //어디선가 해쉬화 해온다.
  return bcrypt.compareSync(password,user.password);
  //여기서 password는 입력받은 text값이고 user.password가 해쉬값임
  //hash를 해독해서 text를 비교하는게아니라 text값을 해쉬로 바꾸고 그값이 일치하는지 확인하는 과정인듯
};

// model & export
var User = mongoose.model('user', userSchema);
console.log(`User.js의 module보내기전 User = ${User}`);
module.exports = User;
