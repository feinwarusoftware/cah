"use strict";

const fs = require("fs");

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
const WebSocketServer = require("websocket").server;

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

//
app.get("/", (req, res) => {
    return res.render("index");
});

app.get("/:room/:user", (req, res) => {

	let room = rooms.find(e => {
		return e.code === req.params.room;
	});
	if (room === undefined) {
		room = {
			code: req.params.room,
			users: [
				{
					name: req.params.user
				}
			]
		};
		rooms.push(room);
	} else {
		room.users.push({
			name: req.params.user
		});
	}

    return res.render("room", { cards: cards, room: room, user: user});
});
//

class Card {
	constructor(type, text, blanks = 0) {
		this.type = type;
		this.text = text;
		this.blanks = blanks;
	}
	get type() {
		return this.type;
	}
	get text() {
		return this.text;
	}
	get blanks() {
		return this.blanks;
	}
	set type(type) {
		this.type = type;
	}
	set text(text) {
		this.text = text;
	}
	set blanks(blanks) {
		this.blanks = blanks;
	}
}

class BlackCard extends Card {
	constructor(text, blanks = 1) {
		super("black", text, blanks);
	}
}

class WhiteCard extends Card {
	constructor(text) {
		super("white", text, 0);
	}
}

class User {
	constructor(name) {
		this.name = name;
	}
	get name() {
		return this.name;
	}
	set name(name) {
		this.name = name;
	}
}

class Room {
	constructor(code, owner) {
		this.code = code;
		this.owner = owner;
		this.users = [];
		this.users.push(owner);
	}
	get code() {
		return this.code;
	}
	get owner() {
		return this.owner;
	}
	get users() {
		return this.users;
	}
	set code(code) {
		this.code = code;
	}
	set owner(owner) {
		this.owner = owner;
	}
	set users(users) {
		this.users = users;
	}
	addUser(user) {
		this.users.push(user);
	}
	removeUser(name) {
		for (let i = 0; i < this.users.length; i++) {
			if (this.users[i].name === name) {
				users.splice(i, 1);
				return;
			}
		}
	}
}

let blackCards = [];
let whiteCards = [];
let users = [];
let rooms = [];

let conns = [];

let wsServer = new WebSocketServer({
	httpServer: server
});

wsServer.on("request", req => {

	console.log("wss: connection from origin " + req.origin);

	let conn = req.accept(null, req.origin);

	let index = conns.push(conn) - 1;

	console.log("wss: connection accepted");

	//conn.on();

	conn.on("close", conn => {
		console.log("Peer " + conn.remoteAddress + " disconnected");
		conns.splice(index, 1);
	});

	/*
	console.log("Connection from origin "+req.origin);

	let conn = req.accept(null, req.origin);

	let index = chat.push(conn) - 1;

	console.log("Connection accepted");

	if (history.length > 0) {
		JSON.stringify({
			type: "history",
			data: history
		});
	}

	conn.on("message", msg => {
		if (msg.type === "utf8") {

			if (msg === undefined) {
				return;
			}
			const json = JSON.parse(msg.utf8Data);

			if (json.type === "message") {
				console.log("Received message from "+req.origin);

				let obj = {
					type: "message",
					data: {
						user: json.data.user,
						text: htmlEntities(json.data.text)
					}
				}

				history.push(obj);
				history = history.slice(-100);

				for (let i = 0; i < chat.length; i++) {
					chat[i].sendUTF(JSON.stringify(obj));
				}
			}
		}
	});

	conn.on("close", conn => {
		console.log("Peer "+conn.remoteAddress+" disconnected");
		chat.splice(index, 1);
	});
	*/
});

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