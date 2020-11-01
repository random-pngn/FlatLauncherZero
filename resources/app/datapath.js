var path = {
  "current" : "resources/app/",
  "_build" : "",
  "term" : "data/",
};

path["work"] = path["current"] + "random/works/" + path["term"];
path["review"] = path["current"] + "random/reviews/" + path["term"];
path["build"] = "random/works/" + path["term"];

module.exports = path;
