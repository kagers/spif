// JavaScript Document

/* Random and scrolling background animation */

 
var pos=0, speed=150;window.onload=function() {randomImage(); scrollIt(); }
function randomImage() {
var bgImageTotal=3;
var randomNumber = Math.round(Math.random()*(bgImageTotal-1))+1;
var imgPath='templates/rt_quasar_j15/images/backgrounds/'+randomNumber+'.jpg';
document.getElementById('rt-top').style.backgroundImage="url("+imgPath+")";
}
function scrollIt() {

document.getElementById('rt-top').style.backgroundPosition=pos+'px 0px';
pos--;  // specifies left / right or top / bottom.
setTimeout('scrollIt()',speed);
}
