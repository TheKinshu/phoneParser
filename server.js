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

router.get('/api/phonenumbers/parse/text/:number',(req, res) => {
	var list = [];
	if(req.params.number == 'nothing' || req.params.number == ''){
		res.status(400).send([]);
	}
	else{
		var num = req.params.number;
		var phoneNumber = phoneUtil.parse(num,'CA');
		list.push(phoneUtil.format(phoneNumber, PNF.INTERNATIONAL));
		res.status(200).send(list);
	}
});

router.get('/',(req, res) => {
	res.status(200).send('ITS WORKING!');
});

router.get('/api/phonenumbers/parse/file', (req, res) => {
    res.sendFile(__dirname + "/fileparse.html");
});

var storage = multer.diskStorage({	
	destination: function(req, file, callback) {
		callback(null, './uploads')
	},
	filename: function(req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});

app.post('/api/phoneNumbers/parse/file', function(req, res) {
	var list = [];
	var regMatch = /^[a-z]*$/gi
	var upload = multer({
		storage: storage,
		fileFilter: function(req, file, callback) {
			var ext = path.extname(file.originalname)
			if (ext !== '.txt') {
				return callback(res.end('Only text are allowed'), null)
			}
			callback(null, true)
		}
	}).single('userFile');
	upload(req, res, function(err) {
		var buffer = fs.readFileSync(req.file.path);
		buffer.toString().split(/\n/).forEach(function(line){
			if(regMatch.test(line)){
			}
			else{
				var temp = phoneUtil.parse(line,'CA');
			}
			if(!isEmpty(temp)){
				list.push(phoneUtil.format(temp,PNF.INTERNATIONAL));
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