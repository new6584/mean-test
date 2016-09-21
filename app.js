var express = require('express'),  
    path = require('path'),
    fs = require('fs'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express(),
    staticRoot = __dirname + '/',
    api = require('./app/routes/api.js'),
    schemas = require('./app/models/models'),
    mongoose = require('mongoose'),
    emailer = require('email-verification')(mongoose);

app.set('port', (process.env.PORT || 3000));
app.use(express.static(staticRoot));
mongoose.connect('mongodb://localhost/razTestDB');
console.log('mongoose connected');

// view engine setup
app.set('views', path.join(staticRoot, '\\app\\views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/')));

app.get('*', api);
app.post('*',api);

app.listen(app.get('port'), function(req,res) {  
    console.log('app running on port', app.get('port'));
});