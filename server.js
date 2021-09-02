//
// Node.js WebSocket server script.
// ..now just for rpi3b+('NidRdyMay2020_lo9.img').
// 23-may-2021
//

'use strict'

const express = require('express'),
      app = express(),
      http = require('http'),
      WebSocketServer = require('websocket').server,
      server = http.createServer(app),
      wsServer = new WebSocketServer({
	    httpServer: server,
	    autoAcceptConnections: true
      }),
      events = require('events'),
      Net = require('net'),
      net = require('net'),	     // client for gpios..
      id_maq=142430;


var sendtoWSapp = new events.EventEmitter,
    debug=1,	// 0
    query_actv=false,
    new_register=true,
    cnnstate=false,
    clients=[];
//




//......................................................................
//
// ..I'm TCP socket client..
// ..del msg_1, servicio motor de DB 'gcc_db_nidoo0.cpp'.
function ConnectDbServer(data) {
  var client = net.connect(8888, 'localhost', function() {
    //console.log('\n}1}Connected to db driver, envío ..  ' + data);
	client.write(data+'\n');
	client.end();
  });
  client.on('error', function(ex) {
    console.log("handled error");
    console.log(ex);
  });
  client.on('data', function(data) {
	//console.log(' }2}Received: ' + data.slice(0,60));
	if ( query_actv && cnnstate && (data.length > 60) ) {
		sendtoWSapp.emit( 'data', data );
	}
	////client.destroy(); // kill client after server's response
  });

  client.on('close', function() {
	console.log(' }3}Connection closed');
	query_actv = false;
  });
}
//



// Web Socket server..
wsServer.on('connect', function(connection) {
  //clients.push(connection);
  console.log( ' [ws]cliente se conecta..  ' + clients[0] );
  
  connection.on('message', function(message) {
	cnnstate = 1;
	console.log(' [ws]input_mssg: ' + message.utf8Data);
	let rs = processPacket(message.utf8Data);	// CRE0.
	//
	/*if ( rs == null ) {
		//console.log( 'err json' );
		//connection.sendUTF('{"msg":"err json"}');
	} else {
		connection.sendUTF( rs ); console.log('Said:'+rs); //dbg.
	}*/
  });
  /*connection.on('connection', function(ws) {
	  console.log( '   ah..  xxxxxcliente se conecta... ' );
    /*ws.on('message', function(message) {
        console.log('received: %s', message);
        sendAll(message);
    });
    ws.send("NEW USER JOINED");
  });*/
  connection.on('close', function(reasonCode, description) {
        console.log(' ..Client has disconnected.. ');
        cnnstate = 0;
  });
  // suscriptor.. for send data, to client ws.. 
  sendtoWSapp.on('data', function(data){
	  /*if (client.readyState === client.OPEN) {// open}*/
	  //console.log(data + '  -|+  ' + cnnstate + ' + ' + connection.readyState);
	  if ( cnnstate == 1 ) {
	    connection.sendUTF( data );
	  }
  });
});
//......................................................................





//
app	.get('/',(req, res) => {
		res.sendFile(`${__dirname}/public/index.html`);
	})

	.get('/json',(req, res) => {
		res.json({
			name : "Yerman",
			age  : 31,
			twitter : "@jonmircha"
		})
	})

	.get('/query',(req, res) => { // consulta db..
		res.sendFile(`${__dirname}/public/query.html`);
		query_actv = true;
		new_register = true;
	})

	.get('/parking',(req, res) => { // solicitud params..
		res.sendFile(`${__dirname}/public/parking.html`);
	})
	// cuando tenga un templating engine como jade, puedo usar .render
//





//
function xxxdebugProperties(jo){
	console.log('\n\n' + jo.data['xath'  ] + '\n\n' + jo.data['cod']
	          + '\n\n' + jo.data['idn'   ] + '\n\n' + jo.data['pk' ]
	          + '\n\n' + jo.data['textQr'] + '\n\n');
}
//

function debugJson(obj) {
	console.log('\nplate: \''+ obj['plate']+'\'');	// dbg
	console.log('user id: \''+ obj['userid']+'\'');
	console.log('price: \''+ obj['price']+'\'');
    console.log('service: \''+ obj['service']+'\'\n');
}

function fixIngccTkns(jsn) {
  let srt = (jsn['service']=='start') ? 1 : 0,
      end = (srt==1) ? 0 : 1,
     date = new Date(),
     mytm = date.getTime()/1000,
    strng = `${id_maq}/${jsn['plate']}/${mytm}/${mytm}/\
${jsn['price']}/${jsn['userid']}/${srt}/${end}`;
	return strng;
}

function processPacket(msg) {		// CRE0.
// json desde la 'parking.html' pag.
	//console.log(' ### ' + msg);	// dbg.
	try {
		let user = JSON.parse( msg );
		if ( user['plate'] == undefined ) {
			return null; ////
		}
		let gcctokens = fixIngccTkns( user );
		//debugJson( user ),		// dbg.
		//console.log(gcctokens);
		new_register = true;
		ConnectDbServer( gcctokens );
	} catch(err) {
		console.error(' >>> ' + err); // !ojo ¡;!
		return null; ///
	}
	return null;
}
//







//
server.listen(8000);

app.use(express.static('public'));

console.log('..Iniciando Express en el puerto 8000..');
//




function mainloop() {
  //console.log( '  tick... '  + query_actv );
  if ( query_actv == true && new_register ) {
	  //console.log('aqui trato de consultar en el tcp server db ');
	  new_register = false;
	  ConnectDbServer( "64229" ); /*queryRegs();*/
  }
}


var intervalID = setInterval(mainloop, 1400);








