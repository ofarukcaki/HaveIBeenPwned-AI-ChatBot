//var apiHandler = require('./api-handler-service');
const request = require('request');

const PWNED_API_URL = "https://haveibeenpwned.com/api/v2/breachedaccount/";

module.exports = {
    findAccount: (query) => {
        return request({url: PWNED_API_URL+query,json:true, headers: {'User-Agent': 'ChatBot'} }, function(err,res,json){
            return json;
        });
    }
}