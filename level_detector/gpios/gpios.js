//
// npm install --save rpio
// sudo node gpio.js
//


'use strict'


//
var rpio = require('rpio'),
    net = require('net'),
    tmr0=0,  tmr1=0,  tmr2=0,  tmr3=0,  tmr4=0, tmr5=149,
    ramp0=0, ramp1=0, ramp2=0, ramp3=0, ramp4=0, ramp5=0,
    //
    txbuf = new Buffer(1),
    rxbuf = new Buffer(7),
    turnoff=0, timetooff=1400;

///    var WebSocketServer = require('websocket').server;
    //echo -n "cancl" | nc -w1 192.168.0.25 1427 xa cancelar.
////    var http = require('http');
    
const { exec } = require('child_process');
//




function processPackt(pkt) {
  let resp=null;
    if      ( pkt ==  'green' ) { tmr0 = 24; }
    else if ( pkt ==    'red' ) { tmr1 = 26; }
    else if ( pkt ==   'rele' ) { tmr2 = 14; }
    else if ( pkt == 'grnrel' ) { tmr0 = 17; tmr2 = 14; }
    //
    else if ( pkt ==  'rele1' ) { tmr2 =  14; }
    else if ( pkt ==  'rele2' ) { tmr3 =  14; }
    else if ( pkt ==  'pilot' ) { tmr4 = 149; }
    else if ( pkt ==  'error' ) { tmr5 = 149; }
    else if ( pkt ==  'cancl' ) { timetooff = 0; resp='ok'; }
    else if ( pkt.slice(0,4) == 'rtc_' ) {
      resp=isSetupTime( pkt.slice(4,) );
    }
    else { return '14'; }
    return resp;
}



rpio.open(15, rpio.INPUT);
console.log('Pin 15 is currently ' + (rpio.read(15) ? 'high' : 'low'));

//
setInterval(function () { 
  console.log('second passed'); 
  //
    if ( tmr0 ) { // tilt.. old..
	--tmr0;
	if ( ++ramp0 > 3 ) ramp0 = 0;
	if ( ramp0 < 2 ) { rpio.write(12, rpio.HIGH);
	}           else { rpio.write(12, rpio. LOW); }
    }
    //
    //
    if ( tmr1 ) { // tilt..
	--tmr1;
	if ( ++ramp1 > 3 ) ramp1 = 0;
	if ( ramp1 < 2 ) { rpio.write(16, rpio.HIGH); }
                    else { rpio.write(16, rpio. LOW); }
    }
    //
    if ( tmr3 ) { // solid.. rel2
	--tmr3;
	if ( ++ramp3 > 4 ) ramp3 = 0;
	if ( ramp3 < 5 ) { rpio.write(16, rpio. LOW); } // [INV]
                    else { rpio.write(16, rpio.HIGH); } // [INV]
    }
    //
    if ( tmr4 ) { // tilt.. pilot
	--tmr4;
	if ( ++ramp4 > 14 ) ramp4 = 0;
	if ( ramp4 < 1 ) { rpio.write(12, rpio.HIGH); }
                    else { rpio.write(12, rpio. LOW); }
    }
    //
}, 1490);




