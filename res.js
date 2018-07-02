var json = require('./res.json');
var mongodb = require('mongodb');

var WORD_COUNT = 0;
var LEVEL_COUNT = 0;
var LEVEL_SIZE = 10;

var WORDS;

var USER_KEY = 'test';
var USER_STATE = 1;

var client, db;

var shuffleArray = function(array) {
  var currentIndex = array.length,
    temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

var generateWords = function(array) {
	var words = [];
	var currentIndex = array.length - 1;

	while (1 !== currentIndex) {
	  var temporaryValue = array[currentIndex];
	  var word = {
      id: currentIndex,
      kanji: temporaryValue.kanji,
      kana: temporaryValue.kana,
      meaning: temporaryValue.meaning,
      options: []
	  };
	  var randomIndex = Math.floor(Math.random() * 4);
	  for (var i = 0; i < 4; i++) {
		if (i == randomIndex)
		  word.options.push(temporaryValue.meaning);
		else
		  word.options.push(array[(currentIndex + i + randomIndex) * (i + 1) % array.length].meaning);
	  }
	  words.push(word);
	  currentIndex -= 1;
	}
	return words;
}



// Standard URI format: mongodb://[dbuser:dbpassword@]host:port/dbname, details set in .env
var uri = 'mongodb://'+process.env.DBUSER+':'+process.env.DBPASS+'@'+process.env.DBHOST+':'+process.env.DBPORT+'/'+process.env.DB;

console.log('connecting '+ uri);

mongodb.MongoClient.connect(uri, function(err, dbclient) {
  if(err) throw err;
  
  client = dbclient;
  console.log('connected');
  
  db = client.db(process.env.DB);
  var tangos = db.collection('tango');
  
  tangos.find({}).sort({id:1}).toArray(function(err, result){
    //console.log(result);
    if(result.length===0) {
      var data=shuffleArray(json);
      WORDS = generateWords(data);
	    tangos.insertMany(WORDS, function(err, result){
	      if(err) throw err;
		    console.log('tango collection created');
	    });
	  }
	  else {
      console.log('tango collection ready');
      WORDS = result;
    }
    WORD_COUNT = WORDS.length;
    LEVEL_COUNT = Math.floor(WORDS.length/LEVEL_SIZE);
    console.log("WORD_COUNT: "+WORD_COUNT);
    console.log("LEVEL_COUNT: "+LEVEL_COUNT);
  });
  
  var accounts = db.collection('account');
  accounts.findOne({key: USER_KEY}, function(err, result){
    console.log(result);
    if(!result) {
      console.log('creating account');
      accounts.insert({key: USER_KEY, state: USER_STATE}, function(err, result){
        if(err) throw err;
        console.log(result);
      });
	  }
	  else {
      USER_STATE = result.state;
    }
    console.log("USER_STATE: "+USER_STATE);
  });
});

var getBatch = function() {
  if(USER_STATE>LEVEL_COUNT) return [];
  var result = WORDS.slice(USER_STATE*LEVEL_SIZE, (USER_STATE+1)*LEVEL_SIZE);
  console.log(result)
  return result;
}

var closeBatch = function() {
  var accounts = db.collection('account');
  accounts.update({key: USER_KEY}, {key: USER_KEY, state: ++USER_STATE}, function(err, result){
    if(err) console.log('close batch failed');
    console.log(result);
  });
}

var resetBatch = function() {
  var accounts = db.collection('account');
  accounts.update({key: USER_KEY}, {key: USER_KEY, state: 1}, function(err, result){
    if(err) console.log('reset batch failed');
    USER_STATE = 1;
    console.log(result);
  });
}

module.exports = { getBatch:getBatch, closeBatch:closeBatch, resetBatch:resetBatch }
