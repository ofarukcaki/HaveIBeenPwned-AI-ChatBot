
const request = require('request');
 
request('https://haveibeenpwned.com/api/v2/breachedaccount/omerf@gmail.com', { json: true,  headers: {
    'User-Agent': 'request'
  } }, (err, res, body) => {
  if (err) { return console.log(err); }
  //console.dir(body[0].Title);
  return body;
  //console.log(body.explanation);
});

// var req = require('request');

// URL = "https://haveibeenpwned.com/api/v2/breachedaccount/omerf@gmail.com";
// var options = {
//     host: 'haveibeenpwned.com',
//     port: 443,
//     path: '',
//     method: 'GET',
//     headers: {
//         'Content-Type': 'application/json'
//     }
// };

// req.get(URL, options,function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//       var info = JSON.parse(body)
//       console.log(info);
//     }else{
//         console.log("err:"+error);
//     }
// });