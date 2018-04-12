"use strict";

const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const bodyParser = require("body-parser");
const sassMiddleware = require("node-sass-middleware");
const http = require("http");
const exphbs = require("express-handlebars");
const ejs = require("ejs");
const session = require("express-session")

const routes = require("./routes");

const app = express();
const server = http.createServer(app);

const port = process.env.PORT || "80";

app.use(logger("dev"));
app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "ejs");

app.use(session({
	secret: "keyboard cat",
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false
	}
}));

app.use(favicon(path.join(__dirname, "static", "favicon.ico")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(sassMiddleware({
	root: path.join(__dirname, "static"),
	src: "/scss",
	dest: "/css",
	indentedSyntax: false, // true: sass, false: scss.
	sourceMap: true
}));
app.use(express.static(path.join(__dirname, "static")));

app.use(routes);

//
app.use((req, res, next) => {
	var err = new Error("Not Found");
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	res.status(err.status || 500);
	res.render("error");
});
//

//
server.on("error", (err) => {
	if (err.syscall !== "listen") {
		throw err;
	}

	let bind = typeof port === "string" ?
		"Pipe " + port :
		"Port " + port;

	switch (err.code) {
		case "EACCES":
			console.error(bind + " requires elevated privileges");
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(bind + " is already in use");
			process.exit(1);
			break;
		default:
			throw err;
	}
});

server.on("listening", () => {
	/*
	let addr = server.address();
	let bind = typeof addr === "string" ?
		"pipe " + addr :
		"port " + addr.port;
    debug("Listening on " + bind);
    */
	console.log("Magic happens on port: " + port);
});
//

server.listen(port);