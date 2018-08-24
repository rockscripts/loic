window.$ = window.jQuery  = require( 'jquery' );
var fs = require('fs');
var path = require("path");
var xml2js = require('xml2js');
var Noty = require('noty');
var PythonShell = require('python-shell');

jQuery(document).on("click",".start-invite-friends",function(e)
{ 
    getGroupInviter();
});

jQuery(document).on("click",".noty_body",function(e)
{ 
   jQuery(this).fadeOut()
});

jQuery(document).on("click",".open-settings",function(e)
{ 
  jQuery(this).hide();
  jQuery(".open-group-invite").fadeIn();
  jQuery(".section-group-invite").hide();
  jQuery(".section-settings").fadeIn();
  var parser = new xml2js.Parser();
    fs.readFile(path.join(__dirname, 'xml/telegram-settings.xml'), function(err, data) {
        parser.parseString(data, function (err, settingsObject) {
            //settingsObject.settings.api
            var apiSettings = settingsObject.settings.api;
            apiSettings = apiSettings[0];

            var pythonEngine = settingsObject.settings.python;
            pythonEngine = pythonEngine[0];

            var sessionSettings = settingsObject.settings.session;
            sessionSettings = sessionSettings[0];

            jQuery("#sessionName").val(sessionSettings.name); 
            jQuery("#sessionAreaCode").val(sessionSettings.areacode);
            jQuery("#fullPhoneNumber").val(sessionSettings.phone);
            jQuery("#apiID").val(apiSettings.id);
            jQuery("#apiHash").val(apiSettings.hash);
            jQuery("#pythonEngine").val(pythonEngine.path);
        });
    });
});

jQuery(document).on("click",".open-group-invite",function(e)
{ 
  jQuery(this).hide();
  jQuery(".open-settings").fadeIn();
  jQuery(".section-settings").hide();
  jQuery(".section-group-invite").fadeIn();
});

jQuery(document).on("click",".save-settings",function(e)
{ 
  var sessionName     = jQuery("#sessionName").val(); 
  var sessionAreaCode = jQuery("#sessionAreaCode").val();
  var fullPhoneNumber = jQuery("#fullPhoneNumber").val();
  var apiID           = jQuery("#apiID").val();
  var apiHash         = jQuery("#apiHash").val();
  var pythonEngine    = jQuery("#pythonEngine").val();

  var xmlOutput = "<settings>"+

                        "<session>"+
                                "<name>"+
                                sessionName+
                                "</name>"+
                                "<areacode>"+
                                  sessionAreaCode+
                                "</areacode>"+
                                "<phone>"+
                                  fullPhoneNumber+
                                "</phone>"+                
                        "</session>"+

                        "<api>"+
                                "<id>"+
                                  apiID+
                                "</id>"+
                                "<hash>"+
                                  apiHash+
                                "</hash>"+          
                        "</api>"+

                        "<python>"+
                                "<path>"+
                                pythonEngine+
                                "</path>"+        
                        "</python>"+
                        
                   "</settings>";

            fs.writeFile(path.join(__dirname, 'xml/telegram-settings.xml'), xmlOutput, function(err) {
                if(err) 
                {
                    new Noty({
                        text: err
                    }).show(); 
                }  
                else
                {
                    new Noty({
                        text: "Settings Saved."
                    }).show(); 
                }      
                
            });  
});

jQuery(document).ready(function()
{ 
    jQuery( ".btn-default" ).mouseover(function() 
      {
         jQuery(this).addClass("icon-button-hover");
      });
    jQuery( ".btn-default" ).mouseleave(function() 
      {
         jQuery(this).removeClass("icon-button-hover");
      });
});

function getGroupInviter()
{  
    
    
    jQuery('.consoleLog').html('');
    jQuery('.consoleLog').fadeIn('fast');

    var parser = new xml2js.Parser();
    console.log(path.join(__dirname, '/../gui/xml/telegram-settings.xml'))

    fs.readFile(path.join(__dirname, 'xml/telegram-settings.xml'), function(err, data) {
        parser.parseString(data, function (err, settingsObject) {
            //settingsObject.settings.api
            var apiSettings = settingsObject.settings.api;
            apiSettings = apiSettings[0];

            var pythonEngine = settingsObject.settings.python;
            pythonEngine = pythonEngine[0];
            
            var sessionSettings = settingsObject.settings.session;
            sessionSettings = sessionSettings[0];

            var sourceGroup      = jQuery("#sourceName").val();
            var destinationGroup = jQuery("#destinationName").val();

            if (fs.existsSync(path.join(__dirname, '/'+sessionSettings.name[0]+'.session')))
            {
              fs.unlinkSync( path.join(__dirname, '/'+sessionSettings.name[0]+'.session'));
            }
            if (fs.existsSync(path.join(__dirname, '/'+sessionSettings.name[0]+'.session-journal')))
            {
              fs.unlinkSync( path.join(__dirname, '/'+sessionSettings.name[0]+'.session-journal'));
            }
            
            var options = 
            {
                mode: 'text',
                pythonPath: pythonEngine.path[0],
                pythonOptions: ['-u'],
                scriptPath: path.join(__dirname, '/engine/'),
                args: [JSON.stringify(apiSettings), JSON.stringify(sessionSettings), sourceGroup, destinationGroup]
            };
            var pyshell = new PythonShell('start.py',options);
            // sends a message to the Python script via stdin
            pyshell.on('message', function (message) {
              // received a message sent from the Python script (a simple "print" statement)
              console.log(message);
              if(message=="askedCode")
              {
                    jQuery(".sentCodeItem").fadeIn();

                    var n = 50;
                    setTimeout(countDown,500);

                    function countDown(){
                    n--;
                    if(n > 0)
                    {
                      setTimeout(countDown,500);
                    }
                    jQuery(".countDown").html(n);
                    if(n==0)
                    {
                      var sentCode = jQuery("#sentCode").val();
                      pyshell.send(sentCode).end();
                    }
                    }              
              }
              else
              {
                jQuery('.consoleLog').append(message);
                //console.log(message)
              }
            });
        });
    });    
}
