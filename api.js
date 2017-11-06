var request = require('request');

request('https://haveibeenpwned.com/api/v2/breachedaccount/test@example.com', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body)
        console.log(info);
        console.log("ww");
    }
})

console.log("qqq");
