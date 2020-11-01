const fs = require('fs-extra');
const markdown = require('markdown').markdown;
const datapath = require('./datapath');
const gamelist = require('./gamelist');
const request = require('request');


var parts = parts || {};
var encoder = encoder || {};
var loader = loader || {};

parts.header = fs.readFileSync(datapath.current + "card.html", "utf-8");
parts.card = fs.readFileSync(datapath.current + "newcard.html", "utf-8");
parts.description = fs.readFileSync(datapath.current + "description_new.html", "utf-8");
parts.star = fs.readFileSync(datapath.current + "star.html", "utf-8");
parts.comment = fs.readFileSync(datapath.current + "comment.html", "utf-8");
parts.imageflow = fs.readFileSync(datapath.current + "imageflow.html", "utf-8");

loader.setting = function(dir) {
  let tmp = gamelist[dir];
  tmp["exec"] = tmp["datapath"];
  tmp["snapshot"] = "play.png";
  tmp["icon"] = "icon.png";
  tmp["name"] = dir;
  return tmp;
}

loader.star = function(dir) {
  let data = {star: 0, review: 0, allstar: 0};
  //request('https://randomer.ch-random.net/test.json', async (error, response, body) => {
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
}

encoder.stars = function(num) {
  num = (new Number(num)).toFixed();
  if(0 <= num && num <= 5) {
    let starHTML = "";
    for(let n = 0; n < 5; n++) {
      const fill = (n < num) ? "" : "outline";
      starHTML += '<i class="icon star ' + fill + ' yellow"></i>';
    }
    return starHTML;
  }
  return "";
}

encoder.stars_large = function (num, review) {
  $html = $(parts.star);
  if(num == undefined) num = 0;
  $html.find('.value').append((new Number(num)).toFixed(1));
  $html.find('.star').append(encoder.stars(num));
  $html.find('.StarReview').html((review == 0) ? "まだレビューがありません" : review + "件のレビュー");
  return $html;
}

encoder.tags = function (tags) {
  function GetTagsColor(data) {
    colors = {"Game" : "red",
      "Music" : "blue",
      "Art" : "orange",
      "Service" : "green"};
    for(var key in colors) {
      if(data == key) {
        return colors[key];
      }
    }
    return "";
  }
  let tagHTML = "";
  if(!tags) return "";
  tags.split(',').forEach(function(data) {
    tagHTML += '<a class="ui tag mini ' + GetTagsColor(data) + ' label">' + data + '</a>'
  });
  return tagHTML;
}

encoder.readme = function(description) {
  return markdown.toHTML(description);
}

encoder.comment = function(json) {
  $html = $(parts.comment);
  $html.find('.author').append(json.author);
  $html.find('.text').append(json.text);
  $html.find('.date').append(date.distanceInWords(new Date(json.time), new Date()) + " ago");
  $html.find('.rating').append('<i class="icon star"></i>'.repeat(json.star));
  return $html;
}

encoder.article = function(data, num) {
  let $entry = $(parts.card);

  $entry.hide();
  $entry.delay(30 * num).fadeIn(100);

  $entry.delay(200 * num).queue(function(next) {
    $entry.find('.ui.active.dimmer').remove();

    let path = "" + datapath.work + data + "/";
    let settings = loader.setting(data);
    (function() {
      if(settings.time == undefined) $entry.find('.Time').remove();
      if(settings.difficulty == undefined) $entry.find('.Difficulty').remove();
      if(settings.developer == undefined) $entry.find('.Developer').remove();
    })();
    $entry.find('.header').append(settings.name);
    $entry.find('.Tags').append(encoder.tags(settings.tags));
    $entry.find('.Snapshot').attr("src", datapath.build + data + "/" + settings.icon);
    $entry.find('.Time').append(settings.time);
    $entry.find('.Difficulty').append(settings.difficulty);
    $entry.find('.Developer').append(settings.developer);
    loader.star(data).then(function(star) {
      $entry.find('.Stars').append(encoder.stars(star));
    });

    next();
  });

  $entry.attr('dir', data);
  return $entry;
}

encoder.header = function() {
  let $entry = $(parts.header);

  return $entry;
}

encoder.imageflow = function(data, num) {
  let $image = $(parts.imageflow);

  let settings = loader.setting(data);

  $image.find('img')
    .addClass('ImageFlow')
    .attr("src", datapath.build + data + "/" + settings.snapshot);

  $image.find(".image").dimmer({
    on: 'hover'
  });

  $image.attr('dir', data);
  return $image;
}

module.exports = {"parts":parts, "encoder":encoder, "loader":loader};
