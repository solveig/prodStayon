/* The CRMDAO must be constructed with a connected database object */
var assert = require('assert');

function CRMDAO(db) {
    "use strict";
    //debugger;
    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof CRMDAO)) {
        console.log('Warning: CRMDAO constructor called without "new" operator');
        return new CRMDAO(db);
    }

    var crmx = db.collection("clients");
    
    //   this.getCrm = function(clients, callback) {
    this.getCrm = function( theLevel,userName,theDate,theTime,callback) {
      "use strict";
      if (theLevel === 'fillIn') {
        // fungertecrmx.aggregate({$match:{"contact":userName}},function(err, x) {
        crmx.aggregate({$match:{'contact':userName}},{$unwind:'$airstrip'},{$match:{'contact':userName}},{$project: { '_id':0,'airstrip.regDate':1,'airstrip.regTime':1}},function(err, x) {
          "use strict";
           if (err) return callback(err, null);
           console.log('fillin:tiden='+theDate);
          console.log('henta fillInn='+JSON.stringify(x[0]));

           callback(err, x)
        });
      }
      else {    	
        console.log('update tiden='+JSON.stringify(theDate[1]));
        //db.clients.aggregate({$match:{"contact":"kari","airstrip.regDate":"12.10.2016"}},{$unwind:"$airstrip"},{$match:{contact:"kari","airstrip.regDate":"12.10.2016"}},{$project: {"_id":0,"airstrip":1}})   
        //crmx.aggregate({$match:{'contact':+'$'+userName,'airstrip.regDate':+'$'+theDate,'airstrip.regTime':+'$'+theTime}},{$unwind:'$airstrip'},{$match:{'contact':+'$'+userName,'airstrip.regDate':+'$'+theDate,'airstrip.regTime':+'$'+theTime}},{$project: {'_id':0,"airstrip":1}},function(err, x) {
        crmx.aggregate({$match:{'contact':userName,'airstrip.regDate':theDate[1]}},{$unwind:'$airstrip'},{$match:{'contact':userName,'airstrip.regDate':theDate[1]}},{$project: {'_id':0,"airstrip":1}},function(err, x) {
          "use strict";
           if (err) return callback(err, null);
           console.log('henta update='+JSON.stringify(x));
           callback(err, x)
        });
      } 

       //vekk crmx.aggregate({$match:{'contact':'kari','airstrip.regDate':'12.10.2015','airstrip.regTime':'12:10:10'}},{$unwind:'$airstrip'},{$match:{'airstrip.regDate':'12.10.2015','airstrip.regTime':'12:10:10'}},{$project: { '_id':0,'airstrip': 1}},function(err, x) {
     }

               
    // called from Content:handleCrmClient
    
    
      this.updateCrm = function (ind,userName,level,jsonEnt, callback) {
        "use strict";
      var result       = null,
          filter       = null,      
          update       = {$push: {airstrip: jsonEnt}},         
          updateU      = {$set:{'airstrip.$':jsonEnt}},
          options      = {   projection: {contact:1, airstrip:1}
                           , sort: {'airstrip.regDate':-1}
                           , returnOriginal: true
                           , upsert: true};
      //   updateU      = {$set:{'airstrip.$.durMin':44}},

      console.log('wwwwww    wwwwwww wwww crm:update :::jsonEnt='+JSON.stringify(jsonEnt));         
      if (level === "update") {
        filter = {"contact":userName,"airstrip.regDate":jsonEnt.regDate,"airstrip.regTime":jsonEnt.regTime};
        result = crmx.findOneAndUpdate(filter
          ,updateU
          , options
           , function(err, r) {
	          "use strict";
            if (err) return callback(err, null);
                          console.log('UpdateCrm update til db = '+JSON.stringify(r));
            callback(err,r);
          } 
        )    	
      } else {    
         filter = {"contact":userName,"airstrip.regDate":jsonEnt.regDate,"airstrip.regTime":jsonEnt.regTime};        
      	
      	
      	 var cursor = crmx.find(filter);
      	 cursor.count(function(err, count){
           console.log("----------------------------Total matches: "+count);
      	 
      	 if (count>0 ) {
          	console.log('!!!!!!!!!!!!!!!!!!!!!!fins noen like');
          	//var xerr  = new Error('Endre data eller klokkeslett. Denne fins fra f�r.');
          	var errorx = new Error("The error message");
            //error.http_code = 404;
            //console.log(error);
            var errorx={'stack':'stack','message':'Endre data eller klokkeslett. Denne fins'};
          	callback(errorx,count);
          }
          else {	
          	var ddd=cursor.toArray();
          	var dd =JSON.stringify(ddd);
          	console.log('xx='+dd);
          	//console.log('mer='+JSON.stringify(xx));
            console.log('oppdaterr!!!!!!!!!!!!!');
            filter = '{"contact":userName}';
            result = crmx.findOneAndUpdate(filter
              , update
              , options
              , function(err, r) {
	              "use strict";
                if (err) return callback(err, null);
                assert.equal(null, err);
                assert.equal(1, r.lastErrorObject.n);
                // assert.equal(1, r.value.airstip.durHours);
                console.log('UpdateCrm fillIn til db = '+JSON.stringify(r));
                callback(err,r);
              }  
            )
          } 
         }); // end cursor.count
 
      } // end else fillIn  
    } // end updateCrm 
  }
module.exports.CRMDAO = CRMDAO;
       //,{$set:{modifiedOn: new Date(), "airstrip.$": jsonEnt } }

      //result = crmx.findAndModify({'query':{"contact":"kari"}, 'update':{$set:{'clients.airstrip':{'xxx':'ddd3'} } },'new': true, 'upsert' : true}, function(err, doing) {
      //console.log('CRm query = '+JSON.stringify(hquery));
//    hupdate = "{$addToSet:{'clients.$.airstrip':jsonEnt }}";
        // ',/"airstrip.regDate/":/"'+jsonEnt.regDate+'/",/"airstrip.regTime/":/"'+jsonEnt.regTime +/"'}';
 