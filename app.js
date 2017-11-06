var restify = require('restify');
var builder = require('botbuilder');
var pwned = require('./haveibeenpwned');
const request = require('request');
var striptags = require('striptags');
//require('dotenv-extended').load();



// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
// MICROSOFT_APP_ID = "f829d265-0e54-4350-a580-407d31613752";
// MICROSOFT_APP_PASSWORD = "gerblVEEQV7;gfRO1126!;)";
var connector = new builder.ChatConnector({
    // appId: "38dfe0ef-1a67-4f37-a74d-0c95711d9d8c",
    // appPassword: "annmzLFI23$&xxGEYA102%$"
    appId: "78434275-b560-4ab1-bf8b-8df8361d6b59",
    appPassword: "hqjskyPXWR694gDPU43$/@{"
});

var bot = new builder.UniversalBot(connector);

// Listen for messages from users
server.post('/api/messages', connector.listen());

// // Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
// var bot = new builder.UniversalBot(connector, function (session) {
//     session.send("You said: %s", session.message.text);
// });


const LuisModelUrl = process.env.LUIS_MODEL_URL ||
'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/be4c7224-f009-46ba-a03a-64def3fd3f5a?subscription-key=1365ffaac4a44cc9a701acdf1fda018f&verbose=true&timezoneOffset=0';

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })


.matches('None', [
    (session) => {
        session.send("I don't understand what you mean :(\n\nStart with typing \"Help\" or ask me what you want.").endDialog();
    }
])

.matches('Help', [
    (session,args) => {    
        
            var msg = new builder.Message(session)
            //.text("You can also use HaweIBeenPwned features by talking with me\n\n")
            .text("I can help you to use HaweIBeenPwned to check if your data are compromised.\n\nWhat you want to search?")
            .suggestedActions(
                builder.SuggestedActions.create(
                        session, [
                            builder.CardAction.imBack(session, "Help email", "Check Email/Username"),
                            builder.CardAction.imBack(session, "Help password", "Check Password")            ]
                    ));
        //session.send(msg);      
        builder.Prompts.text(session,msg);
    },
    (session,results) => {
        if(results.response == 'Help email')
            session.send("You can ask me your email/username just like asking a person\n\n \n\n Try \"Is my email test@ex.com pwned?\"\n\nor just simply:\n\n \"Search test@mail.com\" ");
        else if(results.response == 'Help password')
             session.send("Just enter the command \"Password\" to start");             
    }
])
.matches('Greeting', [
    (session) => {
        //session.send("greetz").endDialog();
        session.send("Hello, start by search something.\n\nIf you need any help please tell me.").endDialog();

    }
])

.matches('Password', [
    function (session) {
        builder.Prompts.text(session, 'Please enter your password, I will check it if it\'s compromised or not:');
    },
    function (session, results) {
        //session.endDialog(`Hello ${results.response}!`);
        //session.send(results.response);
        request('https://haveibeenpwned.com/api/v2/pwnedpassword/'+results.response, { json: true,  headers: {'User-Agent': 'chatBot'} },
        (err,res,body) => {
            if (err) { return console.log(err); }
            //console.log(res.statusCode);     
            if(res.statusCode == 200){
                session.send("ALERT - The password was found in the Pwned Passwords repository");
            }else{
                session.send("The password was not found in the Pwned Passwords repository");                
            }
        });
    }
    
])

.matches('domain', [
    (session,args) => {
        //session.send("greetz").endDialog();
        let hedefDomain = args.entities[0].entity;
        hedefDomain = hedefDomain.replace(/\s/g, '');
       console.log(hedefDomain);
        
       getReqq = (domain) => {
        request('https://haveibeenpwned.com/api/v2/breaches?domain='+domain, { json: true,  headers: {
            'User-Agent': 'request'
          } }, (err, res, body) => {
            if (err) { return console.log(err); }
            if(!body[0]){
                session.send("Domain seems unbreached or wrong!").endDialog();
            }
            else if(body){
                let wol = body[0];    
                
                var msg = new builder.Message(session);
                msg.attachmentLayout(builder.AttachmentLayout.carousel)
                let otherI = {
                    verified : verified = (wol.IsVerified == true) ? 'Yes' : 'No',
                    sens : sens = (wol.IsSensitive == true) ? 'Yes' : 'No',
                    spam : spam = (wol.IsSpamList == true) ? 'Yes' : 'No',
                    retired : retired = (wol.IsRetired == true) ? 'Yes' : 'No',
                    fabricated : fabricated = (wol.IsFabricated == true) ? 'Yes' : 'No'
                }
                msg.attachments([
                    new builder.HeroCard(session)
                        .title(wol.Name)
                        .subtitle("Domain: "+wol.Domain)
                        .text("Breach Date: "+wol.BreachDate+"\n\n"+"\n\n"+
                        "Pwned Accounts: "+wol.PwnCount.toLocaleString()+
                        "\n\n——————\n\nThis breach contains:\n\n"+
                        wol.DataClasses.join("\n\n")),
                        
            
                    new builder.HeroCard(session)
                        .title("About "+wol.Name+" Data Breach")                        
                        .text(striptags(wol.Description)),
                        
                    new builder.HeroCard(session)
                        .subtitle("Other Informations:")                        
                        .text("Is Verified: "+otherI.verified+
                        "\n\nIs Sensitive: "+otherI.sens+
                        "\n\nSpam List: "+otherI.spam+
                        "\n\nIs Retired: "+otherI.retired+
                        "\n\nIs Fabricated: "+otherI.fabricated
                    )          
                ]);
                session.send(msg).endDialog();

                //session.send(striptags(wol.Description));
            }else{ session.send("Domain seems unbreached or wrong!")}
          }); 
    }
    
    getReqq(hedefDomain);
    
}
])
.matches('query', [
    (session,args) => {
      
        pwn = (x) => {
            let entry =  x[0].entity;
            entry = entry.replace(/\s/g, '');
            return entry;
            console.log(x);
        }
        getReq = (urlPart, query) => {
            // checkPastes = (query) => {
            //     request('https://haveibeenpwned.com/api/v2/pasteaccount/'+query), { json: true,  headers: {
            //         'User-Agent': 'chatBot'
            //       } }, (err, res, body) => {
            //       if(body){
            //           return body.length;
            //       }else{
            //           return 0;
            //       }
            // }
            // }

            request('https://haveibeenpwned.com/api/v2/'+urlPart+'/'+query, { json: true,  headers: {
                'User-Agent': 'chatBot'
              } }, (err, res, body) => {
              if (err) { return console.log(err); }
              
                if(body){
                    var quantity = body.length;
                    session.send("Oh no — pwned!")
                      
                    let newArray = body.map (ham => 
                        builder.CardAction.imBack(session, ham.Domain, ham.Title),
                    );
                   
                    var msg = new builder.Message(session);
                    msg.attachmentLayout(builder.AttachmentLayout.list)
                    msg.attachments([
                        new builder.HeroCard(session)  
                        .text("Pwned on "+body.length+" breached sites...\n\nClick for more details")              
                             .buttons(newArray)        
                                               
                    ]);
                    session.send(msg).endDialog();

                }else{
                    session.send("Goog news! No pwnage found!");
                }
                // let pasteaccount = checkPastes(query);
                // if(pasteaccount > 0){
                //     session.send("Your account also available on "+pasteaccount+"paste!");
                // }               
            });
            
        }
        
        var strr = args.entities[0].entity;        
        strr = strr.replace(/\s/g,'');
        console.log("str: "+strr);
        getReq('breachedaccount',strr);
        
     }
])
.onDefault((session) => {
    session.send("I'm smart but  I can't understand everything you said, I'm just a baby bot ;) \n\n But I'm learning fast! More people interact with me more will I learn...\n\nCan you try to ask something simple?").endDialog();
});

bot.dialog('/', intents);