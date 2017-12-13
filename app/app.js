var express = require('express'),
    app = express(),
    port = 8081;

app.use(express.static(__dirname + '/public'));
app.listen(port);