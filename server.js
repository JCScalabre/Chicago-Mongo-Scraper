var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
var mongoose = require("mongoose");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static(__dirname + "/public"));

// Initiate handlebars with default layout
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
app.use(bodyParser.json());

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/MongoScraper", {
	useMongoClient: true
});

app.get("/saved", function(req, res) {
	db.Article
		.find({ saved: true })
		.then(function(dbSavedArticles) {
			res.render("saved", dbSavedArticles)
		})
})

app.get("/", function(req, res) {
	db.Article
		.find()
		.then(function(dbArticle) {
			res.render("index", dbArticle);
		})
})

app.get("/scrape", function(req, res) {
	request("https://chicago.suntimes.com/section/news/", function(error, response, html) {

		var $ = cheerio.load(html);

		// An empty array to save the data that we'll scrape
		var results = [];

		// With cheerio, find each div with the 'section-front' class:

		$("div.section-front").each(function(i, element) {

			var title = $(element).children("div.section-title").children("h3").children("a").text();
			var link = $(element).children("div.section-title").children("h3").children("a").attr("href");
			var summary = $(element).children("div.section-title").children("div.post-excerpt").children("p").text();
			var image = $(element).children("div.section-image").children("div.post-lead-media").children("a").children("img").attr("src");

			// Save these results in an object that we'll push into the results array we defined earlier
			results.push({
				title: title,
				link: link,
				summary: summary,
				image: image
			});
			// Uncomment this line if you want to limit scrape to 10 results: 
			// return i < 9;
		});
		console.log(results);
		// db.Article.remove({});
		db.Article.create(results);
	});
	res.send("Scrape Complete");
});

app.get("/articles", function(req, res) {
	db.Article
		.find()
		.then(function(data) {
			res.json(data)
		});
});

app.get("/articles/:id", function(req, res) {
	db.Article
		.findOne({ _id: req.params.id })
		.populate("note")
		.then(function(dbArticle) {
			res.json(dbArticle)
		});
});

app.post("/articles/save/:id", function(req, res) {
	db.Article.update({ _id: req.params.id }, { $set: {saved: true }})
	.then(function(dbArticle) {
		res.json(dbArticle)
	});
});

app.post("/articles/unsave/:id", function(req, res) {
	db.Article.update({ _id: req.params.id }, { $set: {saved: false }})
	.then(function(dbArticle) {
		res.json(dbArticle)
	});
});

app.post("/articles/:id", function(req, res) {
	db.Note
		.create(req.body)
		.then(function(dbNote) {
			return db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { note: dbNote._id }}, { new: true });
		}).then(function(dbArticle) {
			res.json(dbArticle);
		});
});

// Start the server
app.listen(PORT, function() {
	console.log("App running on port " + PORT + "!");
});