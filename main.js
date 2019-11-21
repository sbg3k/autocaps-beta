const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const verify = require("./server/verify.js");

app.set("port", process.env.PORT || 8080);
app.use(express.static(__dirname+"/public"));


app.get("/", async (req, res) => {
	res.status(200);
	res.set("Content-Type", "text/html");
	res.send("home");
})


app.get("/admin/:password/run", async (req, res) => {
	let { params: {password} } = req;
	if(!verify(password)){
		res.status(400);
		res.set("Content-Type", "text/plain");
		res.send("400 - Forbidden or malformed request");
		return;
	}
	async function run_session(){
		return new Promise((resolve, reject) => {
			fs.readFile(path.resolve(__dirname, "./server/stats.json"), "utf8", (err, data) => {
				if(!err){
					let stats = JSON.parse(data);
					if(Number(stats.sessions_active) < 1){
						let mailer = require("./server/mailer/mailer.js");
						stats.sessions_active += 1;
						let stats_json = JSON.stringify(stats);
						fs.writeFile(path.resolve(__dirname, "./server/stats.json"), stats_json, "utf8", (e) => {
							if(e){ reject(e); }
						});
						mailer();
						resolve(true);
					}
				}else{ reject(err); }
			})
		})
	}
	run_session().catch((e) => { console.log(e) });
	res.status(202);
	res.set("Content-Type", "text/plain");
	res.send(`202 - Mailing session active`);
})

app.get("/admin/:password/stats", async (req, res, next) => {
	let { params: {password} } = req;
	if(!verify(password)){
		res.status(400);
		res.set("Content-Type", "text/plain");
		res.send("400 - Forbidden or malformed request");
		return;
	}
	fs.readFile(path.resolve(__dirname, "./server/stats.json"), "utf8", (err, data) => {
		if(err){
			next();
			return;
		}
		let d = JSON.parse(data);
		res.json(d);
	})
})


app.get("/admin/:password/errors", async (req, res, next) => {
	let { params: {errors} } = req;
	if(!verify(errors)){
		res.status(400);
		res.set("Content-Type", "text/plain");
		res.send("400 - Forbidden or malformed request");
		return;
	}
	fs.readFile(path.resolve(__dirname, "./server/error.log"), "utf8", (err, data) => {
		if(err){
			next();
			return;
		}
		res.status(200);
		res.set("Content-Type", "text/plain");
		res.send(data);
	});
});

/* ERROR pages */
app.use((req, res) => {
	res.status(404);
	res.set("Content-Type", "text/plain");
	res.send("404 - Page Not Found");
})// 404

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	// add_err_to_log(500);
	res.status(500);
	res.set("Content-Type", "text/plain");
	res.send("500 - Internal Server Error");
});//500

// start server
app.listen(app.get("port"), () => {
	console.log("Running AutoCaps on "+app.get("port"));
})