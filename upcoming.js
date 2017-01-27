// todays date;
    Date.prototype.today = function () { 
        return this.getFullYear() +"-"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) + "-"+((this.getDate() < 10)?"0":"") + this.getDate();
    }
    // time now
    Date.prototype.timeNow = function () {
         return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
    }
    
    function start() {
      // 2. Initialize the JavaScript client library.
      gapi.client.init({
        'apiKey': 'AIzaSyByFXi14Vw0rUsK0NM3O4QzoS5-FZElg6M',
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
      }).then(function() {
        // 3. Initialize and make the API request.
        return gapi.client.calendar.events.list({
          calendarId: '971iktl8jaj52p9jdot4ja252o@group.calendar.google.com'
        });
      }).then(function(response) {
        console.log(response.result);
        // filter out old events
        var evs = response.result.items;
        var upcoming = [];
        var now = new Date(new Date().today() +'T'+ new Date().timeNow());
        console.log(now);
        for (var i = 0; i < evs.length; i++) {
          //console.log((evs[i].start.dateTime));
          //console.log(new Date(evs[i].start.dateTime));
          if (new Date(evs[i].start.dateTime) > now) { // compare dates
            upcoming.push(evs[i]);
          }
        }
        console.log(upcoming);
        var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                      'September', 'October', 'November', 'December'];
        
        for (var i = 0; i < 4; i++) {
            if (i < upcoming.length) {
              var curr = new Date(upcoming[i].start.dateTime);
              var end  = new Date(upcoming[i].end.dateTime);
              var div = document.createElement('div');
              div.className = 'event';
              div.innerHTML = '<br><br><time datetime="'+curr.toDateString()+'" class="icon">\
                                <em>'+days[curr.getDay()]+'</em>\
                                <strong>'+months[curr.getMonth()]+'</strong>\
                                <span>'+curr.getDate()+'</span>\
                                </time>\
                                '+'<h6 class="summary">'+upcoming[i].summary+'</h6>'+
                                '<p class="summary">'curr.getHours()+':'+curr.getMinutes()+' - '+
                                end.getHours()+':'+end.getMinutes()+'</p>';
              document.getElementById('upcoming').appendChild(div);
            }
        }
       }, function(reason) {
        console.log('Error: ' + reason);
       });
    };
    // 1. Load the JavaScript client library.
    gapi.load('client', start);
