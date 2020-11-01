//requirement
const fs = require('fs-extra');
const path = require('path');
const date = require('date-fns');
const exec = require('child_process').exec;
const markdown = require('markdown').markdown;

const server = require('./review');
const element = require('./element');
const datapath = require('./datapath');
const gamelist = require('./gamelist');

var dirs = {};

function ReadDir(tagFilter) {
  //サーバー更新
  UpdateReviews();

  tagFilter = tagFilter || "";

  return new Promise(function(resolve, reject) {
    $('.Entries').html("");

    //help
    $('.Entries').append(
    element.encoder.header()
      .on('click', function() {
        $('#Help').modal('show');
      }));

    //content
    dirs = Object.keys(gamelist).filter(function(file) {
      return tagFilter == "" ||
        element.loader.setting(file + "/").tags.indexOf(tagFilter) > -1;
    });


    stars = dirs.map(function (value) {
      return new Promise(
        function (resolve, reject) {
          element.loader.star(value).then(function (star) {
            resolve({"key":value, "star":star});
          });
        }
      );
    });

    Promise.all(stars)
     .then(function (message) {
       console.log(message);
       message.sort(function (a,b) {
         return b.star - a.star;
       });

       dirs = message.map(function (value) {
         return value.key;
       });
       return dirs;
     })
     .then(function (dirs) {
       dirs.forEach(function (data, num) {
         $('.Entries')
           .append(element.encoder.article(data, num)
         );
       });

       if(!$('.ScrollList').hasClass('Done')) {
         $('.ScrollList').delay(1000).queue(function (next) {
           dirs.forEach(function (data, num) {
             $image = element.encoder.imageflow(data, num);
             $('.slider-hero')
               .slick(
                 'slickAdd',
                 $image
               );
             $('.ScrollList')
               .slick(
                 'slickAdd',
                 $image
               );
           });
           $('.ScrollList').addClass('Done');

           next();
         });
       }
     });

     resolve();
  });
}

//あとできれいにする
function Pickup() {
  const dir = $(this).attr('dir');
  const dirpath = datapath.work + dir + "/";
  const settings = element.loader.setting(dir);
  let data = {star: 0, review: 0, allstar: 0};
  let newComment = {author : "", text : "", star: 0, time: 0};

  let $desc = $(element.parts.description);
  $desc.find(".image").dimmer({
    on: 'hover'
  });

  //基本情報
  (function() {
    if(settings.exec == undefined) $desc.find('.Play').remove();
    if(settings.time == undefined) $desc.find('.Time').remove();
    if(settings.difficulty == undefined) $desc.find('.Difficulty').remove();
    if(settings.developer == undefined) $desc.find('.Developer').remove();
  })();
  $desc.find('.Title').append(settings.name);
  $desc.find('.Tags').append(element.encoder.tags(settings.tags));
  $desc.find('.Snapshot').attr("src", datapath.build + dir + "/" + settings.snapshot);
  $desc.find('.Difficulty').append(settings.difficulty);
  $desc.find('.Developer').append(settings.developer);
  $desc.find('.Time').append(settings.time);
  $desc.find('.Markdown').append(element.encoder.readme(settings.description));
  $desc.find('.Play')
    .on('click', function(data) {
      let cdir = path.join(datapath.work, dir);
      console.log(settings.exec);
      exec("\"" + settings.exec + "\"", {cwd: cdir}, function(err, stdout, stderr) {
        if (err) { console.log(err); }
        console.log(stdout);

      });
    });
  //アンケート
  $desc.find('[name="Author"]')
    .on('change', function() {
      newComment.author = $(this).val();
    });
  $desc.find('[name="Text"]')
    .on('change', function() {
      newComment.text = $(this).val();
    });
  $desc.find('.ui.dropdown').dropdown();
  $desc.find('.popup').popup();
  $desc.find('.Answer').find('.Save')
    .on('click', function(data) {
      newComment.star = Number($desc.find('[name="Stardrop"]').val());
      if(newComment.star == 0) return;
      newComment.time = (new Date()).getTime();
      if(newComment.author == "") newComment.author = "Anonymous";
      if(newComment.text == "") newComment.text = "no text";

      $desc.find('.Reviews').prepend(element.encoder.comment(newComment));
      new Promise(function(resolve, reject) {
        let dirPath = path.join(datapath.review + dir);
        fs.mkdirs(dirPath, function() {
          resolve(dirPath);
        });
      })
      .then(function(dirPath) {
          fs.writeFile(
            path.join(dirPath, newComment.time + '.json'),
            JSON.stringify(newComment),
            function(err) {
              if(err) {
                console.log(err);
                throw err;
              }
          });
        }
      );

      $desc.find('[name="Author"]').val("");
      $desc.find('[name="Text"]').val("");
      $desc.find('[name="Stardrop"]').val("");
    });
    $desc.find('.Answer').find('.Cancel')
      .on('click', function(data) {
        $desc.find('[name="Author"]').val("");
        $desc.find('[name="Text"]').val("");
        $desc.find('[name="Stardrop"]').val("");
      });
    //コメント
  /*
  return new Promise(function(resolve, reject) {
    fs.readdir(datapath.review + dir, function(err, files) {
      if(files != undefined) {
        let fileList = files.filter(function(file){
            return (path.extname(file.toString()) == '.json'); //絞り込み
        });
        fileList.forEach(function(file) {
          let jsonFile = JSON.parse(fs.readFileSync(datapath.review + dir + "/" + file));
          data.review++;
          data.allstar += jsonFile.star;
        });
      }
      if(data.review != 0) data.star = data.allstar / data.review;
      return resolve(data.star);
    });
  });
  */
    let fileList = Object.keys(gamelist).filter(function(file){
        return (path.extname(file.toString()) == '.json'); //絞り込み
    });
    fileList.forEach(function(file) {
      let jsonFile = JSON.parse(fs.readFileSync(datapath.review + dir + "/" + file, 'utf-8'));
      console.log(jsonFile + "!!!");
      $desc.find('.Reviews').prepend(element.encoder.comment(jsonFile));
      data.review++;
      data.allstar += jsonFile.star;
    });
    console.log(data, data.allstar);
    if(data.review != 0) data.star = data.allstar / data.review;
    $desc.find('.Stars').append(element.encoder.stars_large(data.star, data.review));

  $('#Pickup').html($desc);
  $('#Pickup').modal('show');
  setTimeout(() => {
    $(".ui.dimmer.modals.page.transition.visible.active").scrollTop(0);
  }, 800);
  // もっといいやり方あったら教えてくれ
}

//サーバーからデータを読み込む
function UpdateReviews() {
  return; //サーバーがもうない, コードも書き直しが必要

  fs.readdir(worksPath, function(err, dirs) {
    if(err) {
      throw err;
    }
    console.log(dirs);
    dirs.forEach(dirname => {
      server.get(dirname)
        .then(reviews => {
          (new Promise((resolve, reject) => {
            fs.access(reviewsPath + dirname, fs.constants.R_OK | fs.constants.W_OK, (error) => {
              if (error) {
                if (error.code === "ENOENT") {
                  fs.mkdirSync(reviewsPath + dirname);
                } else {
                  reject(error);
                }
              }
              resolve();
            });
          })).then(_ => {
            //該当作品ディレクトリdirname＆reviewsにサーバーの該当レビュー

            //サーバーに送信
            fs.readdir(reviewsPath + dirname, function(err, files) {
              if(files != undefined) {
                files = files.filter(function(file){
                  return (path.extname(file.toString()) === '.json'); //絞り込み
                });
                files.forEach(function(file) {
                  let localreview = JSON.parse(fs.readFileSync(reviewsPath + dirname + "/" + file, 'utf-8'));
                  localreview.dir = dirname;
                  reviews.forEach(data => {
                    if(localreview && localreview.time === data.time) localreview = null;
                  });
                  if(localreview !== null) {
                    console.log("送信",localreview);
                    server.add(localreview);
                  }
                });
              }
            });

            //データをローカルに書きこみ
            reviews.forEach(data => {
              console.log(data);
              const filepath = reviewsPath + data.dir + "/" + data.time + ".json";
              fs.access(filepath, fs.constants.R_OK | fs.constants.W_OK, (error) => {
                if(error) {
                  if (error.code === "ENOENT") {
                    //存在しないので作る
                    let newdata = {"author":data.author, "text":data.text, "star":data.star, "time":data.time};
                    fs.writeFile(
                      filepath,
                      JSON.stringify(newdata),
                      function(err) {
                        if(err) {
                          console.log(err);
                          throw err;
                        }
                    });
                  } else {
                    console.log(error);
                  }
                }
              });
            });
          });
        });
    });
  });
}

//ready main
$(_ => {
  //load
  ReadDir();

  //delegate
  //これはおそらくでかいやつ => dimmedにしたくない?

  $('.ScrollList')
    .on('click', '.Flow', Pickup);

  $('.Entries')
    .on('click', '.Entry', Pickup);

  $('.Entries')
    .on(
      {
        'mouseenter' : function() {
          $(this).addClass('inverted grey');
        },
        'mouseleave' : function() {
          $(this).removeClass('inverted grey');
        }
      },
      '.Entry'
    );

  $('.menu .item').on(
    "click", function () {
      $('.menu .item').removeClass("active");
      $(this).addClass("active");
    }
  );

  $('.Help')
    .on('click', function() {
      $('#Help').modal('show');
    });
  $('.Quit')
    .on('click', function() {
      window.close();
    });
  $('#All')
    .on('click', function() {
      console.log("All");
      ReadDir("");
    });
  $('#Game')
    .on('click', function() {
      ReadDir("Game");
    });
  $('#Music')
    .on('click', function() {
      ReadDir("Music");
    });
  $('#Art')
    .on('click', function() {
      ReadDir("Art");
    });
  $('#Service')
    .on('click', function() {
      ReadDir("Service");
    });

  $('.slider-hero').slick({
     asNavFor:'.slider-nav',
     arrows: true,
     slidesToShow:1,
     prevArrow:'<div class="arrow prev">PREV</div>',
     nextArrow:'<div class="arrow next">NEXT</div>',
   });
  $('.slider-nav').slick({
    asNavFor:'.slider-hero',
    centerMode: true,
    centerPadding: '60px',
    slidesToShow: 3,
    dots: true,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: '40px',
          slidesToShow: 3
        }
      },
      {
        breakpoint: 1000,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: '40px',
          slidesToShow: 1
        }
      }
    ]
  });

})
