const nodemailer = require("nodemailer");

const autocapsmail = process.env.gmail;
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: autocapsmail,
		pass: process.env.pas
	}
})

async function mail(obj, dev){
	if (dev==0) {
		throw "haq"
	}else if(dev == 1){ return true; }// if else block for development phase. do not remove.
	obj.from = autocapsmail;
	let receipt = await transporter.sendMail(obj).catch(e => {
		throw e;
	})
	return receipt;
}

module.exports = mail;
