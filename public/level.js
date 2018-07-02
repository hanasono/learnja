let ls = {
  start: 0,
  word: 1,
  end: 2,
  stat: 3
};

let level_tmpl = `<div class="level">
<template v-if="state == ls.start">
  <button @click="get()">New Batch</button>
</template>
<template v-else-if="state == ls.word">
  <word :word="word" v-on:next-word="next" v-on:wrong-word="wrong" />
</template>
<template v-else-if="state == ls.end">
  <button @click="review()">Review Batch</button>
  <button @click="close()">Close Batch</button>
</template>
<template v-if="state == ls.stat">
    <button @click="get()">New Batch</button>
    <button id="reset">Reset</button>
</template>
</div>`;

let word_tmpl = `<div class="word">
<div class="meaning">
  <h1>{{ word.kanji }}</h1>
  <h3>{{ word.kana }}</h3>
  <button class="play" @click="play">play</button>
</div>
<hr />
<template v-if="state == 0">
  <div class="options">
    <button class="option" v-for="option in word.options" :key="option" @click="pick(option)">
      {{ option }}
    </button>
  </div>
</template>
<template v-else>
  <div class="result">
    <h3 v-bind:class="meaningClass">{{ word.meaning }}</h3>
    <h3 class="next" @click="next">Next >></h3>
  </div>
</template>
</div>`;

let list_tmpl = ``;

Vue.component('level', {
  template: level_tmpl,
  methods: {
    next: function() {
      //if(this.res.length <= this.index - 1)
      this.index++;
      if(this.index >= this.res.length) {
        this.state = ls.end;
      }
      //console.log(this.index);
    },
    wrong: function(word) {
      this.res.push(word);
      console.log(word);
    },
    review: function() {
      this.index = 0;
      this.state = ls.word;
      this.get();
    },
    close: function() {
      this.index = 0;
      this.state = ls.stat;
      
      $.get('/close', function(data){
        console.log('closed'); 
        console.log(data);
      })
    },
    get: function() {
      var that = this;
      $.get('/get', function(data){
        console.log('got'); 
        console.log(this);
        that.state = ls.word;
        that.res = data;
      });    
    }
  },
  computed: {
    word: function() {
      console.log(this.res);
      return this.res[this.index];
    }
  },
  data() {
    return { state: ls.stat, index: 0, res: [] };
  }
});

var tts_url='https://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=${#word}&client=tw-ob&q=$word&tl=ja';

Vue.component('word', {
  template: word_tmpl,
  props: ["word", "next-word", "wrong-word"],
  data: function() {
    return { state: 0, cclass: 'correct' };
  },
  computed: {
    meaningClass: function(){
      return this.state === 1 ? 'correct' : 'wrong';
    }
  },
  created: function() {
    this.play();
  },
  updated: function() {
    this.play();
  },
  methods: {
    play: function() {
      var _word = !!this.word.kanji ? this.word.kanji : this.word.kana;
      var audio = new Audio(tts_url.replace("$word", _word).replace('${#word}', _word.length));
      audio.play();
      console.log(audio);
    },
    pick: function(option) {
      this.state = option === this.word.meaning ? 1 : -1;
      if(this.state === -1) {
        console.log(this.word);
        this.$emit("wrong-word", this.word);
      }
    },
    next: function() {
      this.state = 0;
      this.$emit("next-word");
    }
  }
});