const express = require('express');
const app = express();
const router = express.Router();
const multer = require('multer');

var path = require('path');
var upload = multer({ dest: 'uploads/' });
var PNF = require('google-libphonenumber').PhoneNumberFormat;
var phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
var fs = require('fs');
// Speed up calls to hasOwnProperty
var hasOwnProperty = Object.prototype.hasOwnProperty;

router.get('/api/phonenumbers/parse/text/:number', (req, res) => {
	var list = [];
	try {
		var num = req.params.number.toString().replace(/\D/g, '');;
		if (num.length > 11 || num.length < 10) {
			res.status(400).send('Phone Number not recognize, please try again.');
		}
		else {
			var temp = "";
			temp = num.toString();
			if((temp.charAt(0) == "1" && num.length == 11) || num.length == 10){
				var phoneNumber = phoneUtil.parse(num, 'CA');
				list.push(phoneUtil.format(phoneNumber, PNF.INTERNATIONAL));
				res.status(200).send(list);
			}
			else{
				res.status(400).send('Phone Number not recognize, please try again.');
			}
		}
	}
	catch (err) {
		res.status(400).send('Phone Number not recognize.');
	}
});

router.get('/', (req, res) => {
	res.status(200).send('ITS WORKING!');
});

router.get('/api/phonenumbers/parse/file', (req, res) => {
	res.sendFile(__dirname + "/fileparse.html");
});

var storage = multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './uploads')
	},
	filename: function (req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});

app.post('/api/phoneNumbers/parse/file', function (req, res) {
	var list = [];
	var regMatch = /\D/g;
	var upload = multer({
		storage: storage,
		fileFilter: function (req, file, callback) {
			var ext = path.extname(file.originalname)
			if (ext !== '.txt') {
				return callback(res.end('Only text are allowed'), null)
			}
			callback(null, true)
		}
	}).single('userFile');
	console.log("working");
	upload(req, res, function (err) {
		var buffer = fs.readFileSync(req.file.path);
		buffer.toString().split(/\n/).forEach(function (line) {
			try {
				var numTemp = line.replace(regMatch, '');
				var temp = phoneUtil.parse(numTemp, 'CA');
				if (!isEmpty(temp) && phoneUtil.isValidNumber(temp)) {
					list.push(phoneUtil.format(temp, PNF.INTERNATIONAL));
				}

			}
			catch (err) {
			}

		});
		res.status(200).send(list);
	})
});

app.use(router);

app.listen(9000, () => {
	console.log("Server Started");
});

function isEmpty(obj) {

	if (obj == null)
		return true;

	if (obj.length > 0)
		return false;
	if (obj.length === 0)
		return true;

	if (typeof obj !== "object")
		return true;

	for (var key in obj) {
		if (hasOwnProperty.call(obj, key))
			return false;
	}

	return true;
}

module.exports = router;