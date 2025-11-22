// --- DEFAULT GAME SETTINGS ---
// These are the global variables that the game uses.
// The host menu will change these before starting a game.
var SPEED = 0.004;
var CAMERA_LAG = 0.9;
var COLLISION = 1.1;
var BOUNCE = 0.7;
var mapscale = 5;
var VR = false;
var BOUNCE_CORRECT = 0.01;
var WALL_SIZE = 1.2;
var MOUNTAIN_DIST = 250;
var OOB_DIST = 200;
var LAPS = 3;

// --- PRESET MAPS ---
// I've moved the default map from index.html to here
const DEFAULT_TRACK_CODE = '1,5/0,7 0,7/-1,8 -1,8/-3,9 -3,9/-7,9 -7,9/-9,8 -9,8/-10,7 -10,7/-11,5 -6,7/-4,7 -4,7/-2,6 -2,6/-1,4 -6,7/-8,6 -8,6/-9,4 -1,4/-1,0 1,0/1,5 -11,5/-11,0 -11,0/-10,-1 -10,-1/-8,-1 -8,-1/-7,0 -7,0/-7,2 -9,3/-8,4 -8,4/-6,4 -6,4/-5,3 -5,3/-5,1 -9,1/-9,4 -5,3/-4,4 -4,4/-2,4 -2,4/-1,3 -7,0/-6,-1 -6,-1/-4,-1 -4,-1/-3,0 -3,0/-3,2 -1,0/-1,-2 -1,-2/0,-4 0,-4/2,-5 2,-5/4,-5 4,-5/6,-4 6,-4/7,-2 -3,0/-3,-3 -3,-3/-2,-5 -2,-5/-1,-6 -1,-6/1,-7 1,-7/5,-7 5,-7/7,-6 7,-6/8,-5 8,-5/9,-3 9,-3/9,2 9,2/8,4 8,4/6,5 6,5/4,5 4,5/2,4 2,4/1,2 7,-2/7,2 7,2/6,3 6,3/4,3 4,3/3,2 4,-3/2,-3 2,-3/1,-2 1,-2/1,0 4,-3/5,-2 5,-2/5,1 3,2/3,-1 |-1,3/1,3 6,-4/7,-6 |-7,5 -5,6 -4,5 2,6 1,8 3,9 4,6 3,7 -3,10 -4,12 -10,11 -12,8 -14,8 -12,6 -7,10 -12,2 -15,3 -13,-1 -10,-4 -8,-2 -6,-4 -4,-3 -11,-2 -8,-3 -4,-5 -3,-6 -5,-2 0,-8 -2,-8 -4,-8 -5,-6 -3,-10 2,-9 4,-8 5,-10 6,-8 10,-7 8,-7 9,-11 9,-5 15,-4 11,-2 11,-1 10,3 16,2 12,1 8,6 7,9 6,6 -8,-7 -13,-7 -13,-4 -15,-4 -17,0 |1,3,6/22 0,3,8/55 -2,3,9/77 -8,3,9/115 -10,3,8/148 -11,3,6/166 -8,3,4/-86 -7,3,4/-83 -6,3,4/-90 -10,3,-1/-83 -9,3,-1/-88 -8,3,-1/-90 -6,3,-1/-89 -5,3,-1/-89 -4,3,-1/-89 -4,3,4/-90 -3,3,4/-90 -2,3,4/265 -3,3,-4/194 -2,3,-6/218 0,3,-7/262 6,3,-7/-69 8,3,-6/-42 9,3,-4/-16 9,3,4/40 8,3,5/70 2,3,5/135 3,3,6/122|eval()';

// --- ADDED MUSIC FUNCTIONS BACK ---
const menuMusic = new Audio("menuloop.wav");
menuMusic.loop = true;
menuMusic.volume = 0; // start silent

// Fade helpers
function fadeIn(audio, duration = 1000) {
  const step = 1 / (duration / 50);
  audio.volume = 0;
  audio.play();
  const fade = setInterval(() => {
    audio.volume = Math.min(1, audio.volume + step);
    if (audio.volume >= 1) clearInterval(fade);
  }, 50);
}

function fadeOut(audio, duration = 1000) {
  const step = audio.volume / (duration / 50);
  const fade = setInterval(() => {
    audio.volume = Math.max(0, audio.volume - step);
    if (audio.volume <= 0) {
      clearInterval(fade);
      audio.pause();
    }
  }, 50);
}
// --- END MUSIC FUNCTIONS ---


const PRESET_MAPS = [
    {
        id: 'default_track', 
        name: 'Default Track',
        description: 'The classic figure-8 track.',
        image_url: 'track1.png',
        map_code: DEFAULT_TRACK_CODE,
        default_laps: 3,
        default_speed: 0.004,
        default_bounce: 0.7,
        default_mountain: 250,
        default_oob: 200
    },
    {
        id: 'nascar_track',
        name: 'Nascar Track',
        description: 'Increased speed, nascar race track',
        image_url: 'nascarwide.png',
        map_code: '-3,0/-3,14 -3,14/-4,18 -4,18/-8,22 -8,22/-12,23 3,16/2,20 2,20/0,23 -10,29/-6,28 -6,28/-3,26 -3,26/0,23 -12,23/-18,23 -18,23/-22,22 -22,22/-26,18 -26,18/-27,14 -10,29/-20,29 -20,29/-24,28 -24,28/-27,26 -27,26/-30,23 -30,23/-32,20 -32,20/-33,16 -27,14/-27,-13 -27,-13/-26,-17 -26,-17/-22,-21 -22,-21/-18,-22 -33,16/-33,-15 -33,-15/-32,-19 -32,-19/-30,-22 -30,-22/-27,-25 -27,-25/-24,-27 -24,-27/-20,-28 -3,-13/-3,0 -3,-13/-4,-17 -4,-17/-8,-21 -8,-21/-12,-22 -18,-22/-12,-22 -20,-28/-10,-28 -10,-28/-6,-27 -6,-27/-3,-25 -3,-25/0,-22 0,-22/2,-19 2,-19/3,-15 3,-15/3,16 |-3,3/3,3 -27,-3/-33,-3 |-19,20 -20,19 -21,19 -22,18 -22,17 -22,16 -22,15 -21,15 -20,15 -20,14 -21,13 -21,12 -22,11 -23,10 -23,7 -22,6 -21,5 -21,4 -21,3 -20,2 -21,1 -22,0 -23,0 -23,-1 -24,-1 -24,-2 -24,-3 -24,-4 -24,-6 -24,-7 -23,-7 -23,-8 -23,-9 -22,-9 -22,-10 -21,-11 -21,-12 -21,-13 -21,-14 -21,-15 -21,-16 -20,-16 -19,-16 -18,-16 -17,-16 -16,-16 -15,-16 -15,-15 -14,-14 -14,-12 -14,-11 -14,-10 -13,-10 -11,-10 -10,-10 -9,-10 -8,-9 -8,-8 -7,-8 -7,-7 -8,-6 -8,-5 -7,-4 -7,-3 -6,-2 -5,-1 -4,0 -4,1 -5,2 -5,4 -6,6 -7,9 -7,10 -7,11 -7,12 -8,13 -8,14 -8,15 -9,15 -10,16 -11,16 -11,17 -12,17 -13,16 -13,14 -13,13 -11,-16 -10,-16 -9,-16 -8,-15 -8,-14 -8,-13 -8,-12 -8,-10 -9,-9 -9,-7 -11,-6 -12,-5 -14,-5 -16,-5 -16,-4 -15,-2 -15,0 -14,1 -14,2 -13,2 -12,2 -10,2 -9,2 -8,2 -8,3 -9,3 -10,4 -12,5 -14,5 -16,5 -17,4 -18,3 -18,2 -18,1 -19,1 -19,2 -18,4 -17,6 -16,7 -15,9 -13,9 -12,10 -11,11 -10,11 -10,12 -10,13 -11,14 -12,16 -13,17 -14,17 -16,18 -17,17 -17,16 -18,15 -18,14 -17,14 -17,13 -16,13 -16,12 -14,13 -12,14 -11,15 -10,17 -10,18 -10,19 -10,20 -11,20 -41,-9 -41,-8 -40,-8 -39,-8 -38,-7 -37,-6 -37,-5 -37,-3 -37,-2 -38,-1 -40,0 -41,0 -42,0 -43,0 -43,-1 -42,-2 -41,-2 -39,-1 -38,1 -37,2 -38,3 -39,4 -41,6 -43,7 -42,7 -40,7 -39,8 -39,10 -39,11 -40,12 -41,13 -42,14 -42,15 -42,16 -41,17 -41,18 -42,20 -42,21 -41,21 -40,22 -40,24 -40,25 -40,26 -39,27 -38,28 -37,28 -36,28 -36,27 -35,27 -36,26 -36,24 -36,23 -36,22 -35,22 -35,23 -34,23 -33,25 -32,27 -32,28 -31,30 -30,31 -29,32 -28,32 -27,32 -25,33 -23,33 -20,33 -19,33 -19,34 -19,35 -19,36 -19,37 -18,37 -17,37 -16,38 -14,38 -13,38 -12,38 -12,37 -11,36 -10,36 -8,37 -6,37 -4,37 -2,36 1,35 2,35 3,34 3,33 4,32 4,31 4,30 5,30 5,29 6,27 7,26 8,25 9,25 9,24 10,24 -38,-10 -39,-10 -40,-11 -41,-12 -45,-14 -47,-16 -47,-18 -47,-19 -45,-21 -43,-21 -41,-21 -39,-21 -40,-21 -42,-21 -43,-23 -42,-25 -40,-26 -38,-27 -37,-27 -36,-27 -37,-26 -37,-28 -35,-31 -33,-32 -29,-33 -25,-33 -20,-32 -18,-31 -19,-31 -20,-30 -21,-30 -21,-31 -21,-32 -22,-33 -22,-35 -22,-36 -22,-37 -21,-38 -20,-39 -20,-40 -19,-41 -18,-41 -17,-42 -15,-43 -12,-43 -10,-44 -9,-44 -9,-43 -8,-42 -8,-40 -8,-39 -8,-37 -8,-36 -7,-36 -5,-37 -4,-37 -3,-37 -6,-36 -9,-36 -14,-36 -17,-37 -19,-38 -20,-38 -24,-38 -25,-38 -26,-38 -27,-38 -27,-37 -27,-36 -27,-34 -28,-32 -29,-31 -29,-30 -30,-28 -30,-27 -30,-26 -31,-29 -32,-31 -33,-33 -33,-35 -32,-37 -30,-38 -23,-38 -19,-39 -15,-39 -12,-39 -9,-39 -6,-39 -3,-38 -1,-38 1,-37 2,-35 3,-33 3,-31 3,-30 4,-30 4,-29 5,-30 5,-31 4,-32 2,-33 2,-34 1,-33 1,-31 2,-29 2,-27 3,-26 4,-24 5,-23 6,-22 7,-22 8,-23 9,-25 9,-26 9,-28 9,-29 9,-31 9,-32 8,-32 8,-30 8,-29 7,-27 7,-24 8,-22 9,-21 10,-20 10,-19 11,-19 12,-19 11,-18 10,-17 9,-16 8,-15 8,-14 8,-13 9,-11 10,-10 12,-9 14,-8 16,-8 16,-7 15,-6 14,-6 14,-5 13,-4 13,-3 13,-2 14,-1 15,-1 16,0 17,0 18,0 19,0 19,1 19,2 17,3 15,4 13,4 12,4 11,4 10,3 10,2 9,1 9,0 9,-1 10,-2 11,-3 15,-3 17,-3 19,-3 20,-2 21,-2 22,-1 22,0 21,2 19,5 16,7 9,9 6,10 5,10 7,10 9,10 10,10 11,11 11,12 10,13 10,14 9,15 9,16 11,17 12,18 14,19 14,20 14,21 12,21 10,22 8,23 7,23 6,23 7,22 7,21 8,19 10,18 11,18 12,17 13,17 18,14 17,14 16,15 15,15 14,15 14,14 13,12 12,9 11,5 11,2 10,1 11,0 12,1 14,2 14,3 3,28 2,29 1,30 0,31 -1,31 -2,32 -2,33 -2,35 -1,36 0,37 2,38 3,38 4,38 5,38 5,37 6,36 5,34 4,33 2,33 0,33 -3,34 -4,34 -5,35 -23,36 -23,37 -22,37 -22,38 -23,39 -24,38 -25,37 -26,36 -26,34 -26,33 -25,32 -24,31 -23,31 -22,31 -22,32 -22,33 -24,33 -33,35 -34,35 -36,35 -36,34 -37,33 -37,32 -37,30 -37,29 -39,30 -46,20 -46,19 -46,18 -46,17 -46,16 -47,15 -48,14 -48,13 -49,12 -48,10 -47,10 -46,9 -45,9 -44,9 -43,9 -46,1 -48,1 -48,0 -49,0 -49,-1 -49,-2 -48,-3 -53,-8 -52,-9 -51,-10 -50,-11 -49,-11 -42,-9 -43,-9 -44,-10 -44,-11 -45,-11 -45,-12 -45,-13 -45,-15 -49,-22 -49,-23 -50,-24 -50,-25 -49,-26 -48,-26 -47,-27 -46,-26 -46,-25 -44,-27 -44,-28 -43,-28 -43,-29 -43,-30 -42,-30 -41,-31 -40,-32 -39,-32 -38,-32 -37,-36 -37,-37 -36,-38 -36,-39 -34,-39 -33,-39 0,-41 1,-41 2,-41 3,-41 14,-31 15,-31 15,-30 16,-29 16,-28 16,-15 15,-14 15,-13 16,-12 17,-12 21,-12 21,-11 21,-9 21,-8 21,9 21,10 22,10 22,11 22,12 22,13 22,14 14,27 13,27 12,29 11,30 11,31 13,36 13,37 12,37 11,38 -3,41 -3,42 -4,43 -5,43 -6,44 -7,44 -7,43 -12,42 -13,42 -13,43 -14,43 -14,44 -22,-15 -22,-14 -19,-15 -20,-13 -20,-15 -18,-15 -19,-17 -18,-17 -16,-17 -17,-17 -20,3 -22,5 -21,14 -21,16 -21,17 -23,8 -23,9 -24,9 -37,23 3,27 2,25 -2,31 -3,30 -3,28 -3,29 -4,31 -4,32 -3,33 -5,30 -7,38 -6,36 11,-10 12,-17 13,-17 14,-17 15,-16 13,-16 15,-18 16,-19 16,-20 22,-10 22,-9 21,-7 20,-8 19,-7 18,-7 21,12 20,13 19,13 23,15 23,16 1,-40 2,-40 2,-39 2,-38 2,-42 1,-42 2,-43 2,-44 3,-40 3,-38 3,-36 -16,-44 -17,-43 -17,-45 -17,-46 -25,-39 -26,-39 -25,-41 -24,-42 -24,-40 -35,-40 -36,-40 -38,-38 -38,-39 -52,-11 -54,-12 -53,-12 -52,-14 -54,-13 -53,-17 -54,-15 -51,-16 -52,-18 -52,-16 -50,-18 -53,-19 -54,-17 -50,1 -50,2 -50,3 -51,4 -52,3 -52,4 -53,4 -53,3 -54,2 -55,0 -50,5 -49,11 -19,-2 -19,-3 -20,-4 -20,-5 -20,-6 -20,-7 -20,-8 -19,-8 -19,-9 -18,-9 -17,-9 -16,-9 -18,-8 -19,-6 -19,-7 -17,-10 -15,-11 -16,-10 -15,-10 -14,-9 -15,-6 -16,-6 ||SPEED*=3;BOUNCE=0.2;MOUNTAIN_DIST=325;OOB_DIST=300;LAPS=10;',
        default_laps: 10,
        default_speed: 0.012,
        default_bounce: 1,
        default_mountain: 325,
        default_oob: 300
    },
	{
        id: 'tree',
        name: 'Tree',
        description: 'tree',
        image_url: 'treewide.png',
        map_code: '1,5/0,7 0,7/-1,8 -1,8/-3,9 -3,9/-7,9 -7,9/-9,8 -9,8/-10,7 -10,7/-11,5 -6,7/-4,7 -4,7/-2,6 -2,6/-1,4 -6,7/-8,6 -8,6/-9,4 -1,4/-1,0 1,0/1,5 -11,5/-11,0 -11,0/-10,-1 -10,-1/-8,-1 -8,-1/-7,0 -7,0/-7,2 -9,3/-8,4 -8,4/-6,4 -6,4/-5,3 -5,3/-5,1 -9,1/-9,4 -5,3/-4,4 -4,4/-2,4 -2,4/-1,3 -7,0/-6,-1 -6,-1/-4,-1 -4,-1/-3,0 -3,0/-3,2 -1,0/-1,-2 -1,-2/0,-4 0,-4/2,-5 2,-5/4,-5 4,-5/6,-4 6,-4/7,-2 -3,0/-3,-3 -3,-3/-2,-5 -2,-5/-1,-6 -1,-6/1,-7 1,-7/5,-7 5,-7/7,-6 7,-6/8,-5 8,-5/9,-3 9,-3/9,2 9,2/8,4 8,4/6,5 6,5/4,5 4,5/2,4 2,4/1,2 7,-2/7,2 7,2/6,3 6,3/4,3 4,3/3,2 4,-3/2,-3 2,-3/1,-2 1,-2/1,0 4,-3/5,-2 5,-2/5,1 3,2/3,-1 |-1,3/1,3 6,-4/7,-6 |-7,5 -5,6 -4,5 2,6 1,8 3,9 4,6 3,7 -3,10 -4,12 -10,11 -12,8 -14,8 -12,6 -7,10 -12,2 -15,3 -13,-1 -10,-4 -8,-2 -6,-4 -4,-3 -11,-2 -8,-3 -4,-5 -3,-6 -5,-2 0,-8 -2,-8 -4,-8 -5,-6 -3,-10 2,-9 4,-8 5,-10 6,-8 10,-7 8,-7 9,-11 9,-5 15,-4 11,-2 11,-1 10,3 16,2 12,1 8,6 7,9 6,6 -8,-7 -13,-7 -13,-4 -15,-4 -17,0 |1,3,6/22 0,3,8/55 -2,3,9/77 -8,3,9/115 -10,3,8/148 -11,3,6/166 -8,3,4/-86 -7,3,4/-83 -6,3,4/-90 -10,3,-1/-83 -9,3,-1/-88 -8,3,-1/-90 -6,3,-1/-89 -5,3,-1/-89 -4,3,-1/-89 -4,3,4/-90 -3,3,4/-90 -2,3,4/265 -3,3,-4/194 -2,3,-6/218 0,3,-7/262 6,3,-7/-69 8,3,-6/-42 9,3,-4/-16 9,3,4/40 8,3,5/70 2,3,5/135 3,3,6/122 | (function(){var s=document.createElement(\'script\');s.src=\'https://breadedtuna.github.io/cars/becometree.js\';s.onload=function(){console.log(\'becometree.js loaded\');if(typeof becometree===\'function\')becometree();};document.head.appendChild(s);})();',
		default_laps: 1,
        default_speed: 0.00000000004,
        default_bounce: 0,
        default_mountain: 350,
        default_oob: 300
	}
];

// This variable will track the menu's state
// It can be one of the map objects from PRESET_MAPS, or the string "custom"
var menuSelectedMap = PRESET_MAPS[0];

// Populate the track code on load
document.getElementById("trackcode").innerHTML = PRESET_MAPS[0].map_code;


function MODS() {}

var firebaseConfig = {
	apiKey: "AIzaSyD7IgsivB3oMoM47ktSPszW0O0OWl8_GNo",
	authDomain: "carsfork-89240.firebaseapp.com",
	databaseURL: "https://carsfork-89240-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "carsfork-89240",
	storageBucket: "carsfork-89240.appspot.com",
	messagingSenderId: "957995738879",
	appId: "1:957995738879:web:87eb1eb1dafb030a5a0eca"
};

// Initialize the only Firebase app
firebase.initializeApp(firebaseConfig);

// Optional: try analytics, but wrap in try/catch so it doesn’t crash if unavailable
try {
	firebase.analytics();
} catch (e) {}

// Sign in anonymously and get database reference
firebase.auth().signInAnonymously().then(() => {
	database = firebase.database();
	
	// Optional: test connection
	database.ref("/testServer").once("value", function(snapshot) {
		console.log("Connected to Firebase successfully.");
	}, function(error) {
		console.error("Error connecting to Firebase:", error);
	});
}).catch(function(error) {
	console.error("Anonymous sign-in failed:", error);
});

setTimeout(function(){
	document.getElementById("title").style.transform = "none";
}, 500);
setTimeout(function(){
	document.getElementsByClassName("menuitem")[0].style.transform = "none";
}, 1000);
setTimeout(function(){
	document.getElementsByClassName("menuitem")[1].style.transform = "none";
}, 1200);
setTimeout(function(){
	document.getElementsByClassName("menuitem")[2].style.transform = "none";
}, 1400);
setTimeout(function(){
	document.getElementById("mywebsitelink").style.transform = "none";
}, 1600);
setTimeout(function(){
	document.getElementById("settings").style.transform = "none";
}, 1800);

function forceScroll(){
	requestAnimationFrame(forceScroll);
	window.scrollTo(0, 0);
}
forceScroll();

var camera, renderer, scene, renderer2, scene2, labels = []; 
scene = new THREE.Scene();
renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
var mobile = /Mobi|Android/i.test(navigator.userAgent);
var tablet = /iPad|Tablet|Nexus 7|Nexus 10|SM-T/i.test(navigator.userAgent);
if(mobile || tablet){
	renderer.shadowMap.enabled = false;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.getElementById("cardboard").className += " disabled";
	console.log(mobile);
}
var element = renderer.domElement;

function toggleFullScreen() {
	var doc = window.document;
	var docEl = doc.documentElement;

	var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
	var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || docEl.webkitExitFullscreen || docEl.msExitFullscreen;

	if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
		requestFullScreen.call(docEl);
	}
	else {
		cancelFullScreen.call(doc);
	}
	window.scrollTo(0,1);
}

var name, code, players = {}, me = {}, gameStarted = false, gameSortaStarted = false, left = false, right = false, lap;
var carPos = [
	{x: 0, y: 0},
	{x: 2, y: 0},
	{x: -2, y: 0},
	{x: 0, y: -3},
	{x: -2, y: -3},
	{x: 2, y: -3},
	{x: 0, y: -6},
	{x: 2, y: -6},
	{x: -2, y: -6},
	{x: 0, y: -9},
	{x: 2, y: -9},
	{x: -2, y: -9},
	{x: 0, y: -12},
	{x: -2, y: -12},
	{x: 2, y: -12},
	{x: 0, y: -15},
	{x: 2, y: -15},
	{x: -2, y: -15}
];
color = Math.floor(Math.random() * 360);
var f = document.getElementById("fore");
var s = document.getElementById("slider");
updateColor = function(){
	s.style.marginLeft = color / 360 * 80 + "vw";
	s.style.backgroundColor = "hsl(" + color + ", 100%, 50%)";
	document.body.style.backgroundColor = "hsl(" + color + ", 50%, 50%)";
}
updateColor();

menu2 = function() {
	fadeIn(menuMusic);

	if (mobile) {
		function reactOrientation(e) {
			var angle = screen.orientation.type == "portrait-primary"
				? e.gamma
				: screen.orientation.type == "portrait-secondary"
				? -e.gamma
				: screen.orientation.type == "landscape-primary"
				? e.beta
				: screen.orientation.type == "landscape-secondary"
				? -e.beta
				: 0;
			me.data.steer = Math.max(Math.min((-angle) / 180 * Math.PI, Math.PI / 6), -Math.PI / 6);
		}

		if (DeviceOrientationEvent.requestPermission) {
			DeviceOrientationEvent.requestPermission("The game needs to access phone tilt so you can steer your car.")
				.then(permissionState => {
					if (permissionState === 'granted')
						window.addEventListener('deviceorientation', reactOrientation);
					else
						alert("Permission denied");
				}).catch(alert);
		} else {
			window.addEventListener('deviceorientation', reactOrientation);
		}
	}

	if (document.getElementById("name").value == "")
		name = "Nerd with No Name";
	else
		name = document.getElementById("name").value;

	VR = document.getElementById("cardboard").className == "tools sel";

	f.style.transform = "translate3d(0, -100vh, 0)";
	setTimeout(function() {
		f.innerHTML = `
			<div class='menuitem title button' id='hostsettings' ontouchstart='this.click()' onclick='openHostMenu()'>Host settings</div>
			<div class='menuitem title button' id='host' ontouchstart='this.click()' onclick='host()'>Host a game</div>
			<div class='menuitem title button' id='join' ontouchstart='this.click()' onclick='joinGame()'>Join a game</div>
		`;
		f.style.transform = "none";

		// Animate buttons in sequence
		setTimeout(function() {
			document.getElementById("hostsettings").style.transform = "none";
			setTimeout(function() {
				document.getElementById("hostsettings").style.transition = "transform .2s, box-shadow .2s";
			}, 500);
		}, 300);

		setTimeout(function() {
			document.getElementById("host").style.transform = "none";
			setTimeout(function() {
				document.getElementById("host").style.transition = "transform .2s, box-shadow .2s";
			}, 500);
		}, 600);

		setTimeout(function() {
			document.getElementById("join").style.transform = "none";
			setTimeout(function() {
				document.getElementById("join").style.transition = "transform .2s, box-shadow .2s";
			}, 500);
		}, 900);
	}, 500);
};

host = function(){
	fadeOut(menuMusic)
	document.getElementById("host").onclick = null;
	f.style.transform = "translate3d(0, -100vh, 0)";
	setTimeout(function(){
		f.innerHTML = "<div class='info title'>Use this code to join the game!<div id='code'>Loading...</div></div><div id='startgame' class='title' onclick='startGame();' ontouchstart='this.click()'>Start!</div><div id='startsettings' class='title' onclick='startMenu();' ontouchstart='this.click()'>Settings</div>";
		if(VR)
			f.innerHTML += "<div id='divider'></div>";
		f.appendChild(element);
		f.style.transform = "none";
		getCode();
	}, 1000);
	
	function getCode(){
		code = "";
		var letters = "ABCDEFGHIJKLMMNOPQRSTUVWXYZ";
		for(var i = 0; i < 4; i++)
			code += letters[Math.floor(Math.random() * letters.length)];
		database.ref(code).once("value", function(codeCheck){
			console.log(codeCheck.val());
			if(codeCheck.val() == null || codeCheck.val().status == -1 || !codeCheck.val().timestamp || Date.now() - codeCheck.val().timestamp > 1000 * 60 * 60 * 24){ // Allow overwriting a game if it was created more than 24 hours ago - seems safe.
				console.log(code);
				document.getElementById("code").innerHTML = code;
				
				database.ref(code).set({
					status: 0,
					players: {},
					map: document.getElementById("trackcode").innerHTML,
					timestamp: Date.now()
				});
				
				database.ref(code + "/players").on("child_added", function(p){
					console.log(p);
					players[p.ref_.path.pieces_[2]] = {
						data: p.val(),
						model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
					};
					var pl = players[p.ref_.path.pieces_[2]];
					pl.model.position.set(pl.data.x, 0.6, pl.data.y);
					pl.model.material = new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
					var wheel = new THREE.Mesh(
						new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
						new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
					);
					var w1 = wheel.clone();
					w1.position.set(0.6, -0.1, 0.7);
					w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w1);
					var w2 = wheel.clone();
					w2.position.set(-0.6, -0.1, 0.7);
					w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w2);
					var w3 = wheel.clone();
					w3.position.set(0.6, -0.1, -0.7);
					w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w3);
					var w4 = wheel.clone();
					w4.position.set(-0.6, -0.1, -0.7);
					w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w4);
					var label = document.createElement("DIV");
					label.className = "label";
					label.innerHTML = pl.data.name.replaceAll("<", "&lt;") + "<br/>|";
					pl.label = label;
					label.position = pl.model.position;
					console.log(label);
					f.appendChild(label);
					labels.push(label);
					pl.model.receiveShadow = true;
					scene.add(pl.model);
					
					if(p.ref_.path.pieces_[2] == me.ref.path.pieces_[2]){
						me.label = pl.label;
						me.model = pl.model;
						me.label.innerHTML = "";
					}
				});
				
				database.ref(code + "/players").on("child_changed", function (p) {
  const id = p.ref_.path.pieces_[2];
  const pl = players[id];
  const newData = p.val();

  if (!pl || !newData) return;

  // Merge server updates into local data
  Object.assign(pl.data, newData);

  // 🔹 Update car color live
  if (pl.model && typeof newData.color !== "undefined") {
    pl.model.material.color = new THREE.Color(
      "hsl(" + newData.color + ", 100%, 50%)"
    );
  }

  // 🔹 Update name label
  if (pl.label && typeof newData.name === "string") {
    pl.label.innerHTML = newData.name.replaceAll("<", "&lt;") + "<br/>|";
  }

  // 🔹 If this client is the one being updated, reflect changes locally too
  if (me && me.ref && me.ref.path && me.ref.path.pieces_[2] === id) {
    if (typeof newData.color !== "undefined" && me.model) {
      me.model.material.color = new THREE.Color(
        "hsl(" + newData.color + ", 100%, 50%)"
      );
    }
    if (typeof newData.name === "string" && me.label) {
      me.label.innerHTML = newData.name.replaceAll("<", "&lt;") + "<br/>|";
    }
    ["checkpoint", "lap"].forEach((key) => {
      if (typeof newData[key] !== "undefined") {
        me.data[key] = newData[key];
      }
    });
  }
});
				
				me.ref = database.ref(code + "/players").push();
				me.data = {
					x: 0,
					y: 0,
					xv: 0,
					yv: 0,
					dir: 0,
					steer: 0,
					color: color,
					name: name,
					checkpoint: 1,
					lap: 0,
					collision: {}
				}
				// --- Only send changed fields to Firebase ---
if (me && me.ref && me.data) {
  if (!me.lastSentData) me.lastSentData = {}; // store previous snapshot
  const diff = {};

  // Compare each key to last sent value
  for (const key in me.data) {
    const val = me.data[key];
    if (me.lastSentData[key] !== val) {
      diff[key] = val;
      me.lastSentData[key] = val;
    }
  }

  // Only push if there’s at least one difference
  if (Object.keys(diff).length > 0) {
    me.ref.update(diff);
  }
}

				// Simple admin edit sync — checks every 100ms for updates
setInterval(() => {
  if (!me || !me.ref) return;
  me.ref.once("value").then((snap) => {
    const val = snap.val();
    if (!val || !me.data) return;

    // List of keys to sync from server
    ["name", "color", "checkpoint", "lap"].forEach((key) => {
      if (val[key] !== me.data[key]) {
        me.data[key] = val[key];

        // Apply updates to visuals
        if (key === "color" && me.model) {
          me.model.material.color = new THREE.Color(
            "hsl(" + val.color + ", 100%, 50%)"
          );
        }
        if (key === "name" && me.label) {
          me.label.innerHTML = val.name.replaceAll("<", "&lt;") + "<br/>|";
        }
      }
    });
  });
}, 100);
				// --- Admin edits / external changes sync (every 100ms) ---
// (skips admin-controlled fields so they don’t get overwritten)
let lastSentData = null;
let syncInterval = null;

function startSync() {
  if (!me.data || !me.ref) return; // wait until setup done
  if (syncInterval) clearInterval(syncInterval);

  lastSentData = "";
  syncInterval = setInterval(() => {
    if (!me.data || !me.ref) return;

    // Copy only movement/physics fields — leave admin fields alone
    const dataToSend = { ...me.data };
    delete dataToSend.color;
    delete dataToSend.name;
    delete dataToSend.checkpoint;
    delete dataToSend.lap;

    const currentData = JSON.stringify(dataToSend);
    if (currentData !== lastSentData) {
      me.ref.update(dataToSend); // only update these safe fields
      lastSentData = currentData;
    }
  }, 200);
}
// --- Listen for admin/external edits safely ---
function startAdminListener() {
  if (!me.ref) return;
  me.ref.on("value", (snapshot) => {
    const serverData = snapshot.val();
    if (!serverData || !me.data) return;

    for (let key in serverData) {
      // skip if not in our data
      if (!(key in me.data)) continue;

      // detect external change
      if (serverData[key] !== me.data[key]) {
        me.data[key] = serverData[key];

        // Color update
        if (key === "color" && me.model) {
          me.model.material.color = new THREE.Color(
            "hsl(" + serverData[key] + ", 100%, 50%)"
          );
        }

        // Name update
        if (key === "name" && me.label) {
          me.label.innerHTML =
            serverData[key].replaceAll("<", "&lt;") + "<br/>|";
        }
      }
    }
  });
}
				// start syncing and admin listening AFTER local data defined
startSync();
startAdminListener();
				
				database.ref(code + "/status").on("value", function(v){
					v = v.val();
					if(v == 1){
						document.getElementsByClassName("info")[0].outerHTML = "";
						document.getElementById("startgame").outerHTML = "";
						document.getElementById("startsettings").outerHTML = "";
						
						gameStarted = true;
						gameSortaStarted = true;
						
						var countDown = document.createElement("DIV");
						countDown.innerHTML = "3";
						countDown.className = "title";
						countDown.id = "countdown";
						f.appendChild(countDown);
						
						lap = document.createElement("DIV");
						lap.innerHTML = "1/" + LAPS;
						lap.className = "title";
						lap.id = "lap";
						f.appendChild(lap);
						
						setTimeout(function(){
							countDown.innerHTML = "2";
						}, 1000);
						
						setTimeout(function(){
							countDown.innerHTML = "1";
						}, 2000);
						
						setTimeout(function(){
							countDown.innerHTML = "GO!";
							gameSortaStarted = false;
						}, 3000);
						
						setTimeout(function(){
							countDown.innerHTML = "";
						}, 4000);
					}
				});
			}else
				getCode();
		});
	}
	
	join();
}

joinGame = function(){
	fadeOut(menuMusic);
	document.getElementById("join").onclick = null;
	f.style.transform = "translate3d(0, -100vh, 0)";
	setTimeout(function(){
		f.innerHTML = "<div class='info title'>Enter a code to join a game!<input id='incode' class='title' onkeyup='codeCheck(event)' ontouchstart='this.focus()'></input></div>";
		if(VR)
			f.innerHTML += "<div id='divider'></div>";
		f.appendChild(element);
		f.style.transform = "none";
	}, 1000);
	join();
}

var map, trees, signs, startc, main;

function deleteMap(){
    // Check if objects exist before trying to access children
	if (map && map.children) {
        while(map.children.length > 0)
		    map.remove(map.children[0]);
	    scene.remove(map);
    }
	if (trees && trees.children) {
        while(trees.children.length > 0)
		    trees.remove(trees.children[0]);
	    scene.remove(trees);
    }
	if (signs && signs.children) {
        while(signs.children.length > 0)
		    signs.remove(signs.children[0]);
	    scene.remove(signs);
    }
	if (startc && startc.children) {
        while(startc.children.length > 0)
		    startc.remove(startc.children[0]);
	    scene.remove(startc);
    }
	if (main && main.children) {
        while(main.children.length > 0)
		    main.remove(main.children[0]);
	    scene.remove(main);
    }
}


function loadMap(){
    // First, clean up any old map that might exist
    deleteMap();

    var trackCodeContent = document.getElementById("trackcode").innerHTML.trim();
    
    // Check for JSON-based map code (from your preset)
    if (trackCodeContent.startsWith("walls=[")) {
        console.log("Loading JSON-based map");
        let mapData;
        try {
            // Simple parser for this specific format
            let wallDataString = trackCodeContent.split(" | ")[0];
            // This is a bit of a hack to make it valid JSON
            wallDataString = wallDataString.replace('walls=', '{"walls":') + '}';
            wallDataString = wallDataString.replace(/'/g, '"'); // Replace single quotes
            
            mapData = JSON.parse(wallDataString);
        } catch (e) {
            console.error("Failed to parse JSON map code:", e, trackCodeContent);
            return;
        }

        var material = new THREE.MeshLambertMaterial({color: new THREE.Color(0xf48342)});
	    map = new THREE.Object3D();

        mapData.walls.forEach(wallDef => {
            var point1 = new THREE.Vector2(wallDef.x1, wallDef.z1);
            var point2 = new THREE.Vector2(wallDef.x2, wallDef.z2);
            
            var wall = new THREE.Mesh(
			    new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale + 0.3, 1.5, 0.3),
			    material
		    );
            var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
		    wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0.75, (point1.y + point2.y) / 2 * mapscale);
		    wall.rotation.set(0, angle, 0, "YXZ");
		    var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
		    wall.plane = plane;
		    wall.width = point1.distanceTo(point2) * mapscale;
		    wall.p1 = point1.multiply(new THREE.Vector2(-mapscale, mapscale));
		    wall.p2 = point2.multiply(new THREE.Vector2(-mapscale, mapscale));
		    wall.castShadow = true;
		    wall.receiveShadow = true;
		    map.add(wall);
        });
        scene.add(map);

        // Add placeholder empty objects for the other parts to avoid errors
        trees = new THREE.Object3D();
        scene.add(trees);
        signs = new THREE.Object3D();
        scene.add(signs);
        
        // Add a simple start line for JSON maps
        startc = new THREE.Object3D();
        var startLine = new THREE.Mesh(
			new THREE.BoxBufferGeometry(10 * mapscale, 0.1, 1),
			new THREE.MeshLambertMaterial({color: new THREE.Color("#2580db")})
		);
        startLine.position.set(0, 0, -45 * mapscale); // Position at one end
        startLine.rotation.set(0, 0, 0, "YXZ");
        startLine.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
        startLine.width = 10 * mapscale;
        startc.add(startLine);
        // Add a checkpoint line
        var cpLine = new THREE.Mesh(
			new THREE.BoxBufferGeometry(10 * mapscale, 0.1, 1),
			new THREE.MeshLambertMaterial({color: new THREE.Color("#db2525")})
		);
        cpLine.position.set(0, 0, 45 * mapscale); // Position at other end
        cpLine.rotation.set(0, 0, 0, "YXZ");
        cpLine.plane = new THREE.Plane(new THREE.Vector3(0, 0, 1));
        cpLine.width = 10 * mapscale;
        startc.add(cpLine);

        scene.add(startc);

    } else {
        // --- ELSE, LOAD ORIGINAL MAP CODE ---
        console.log("Loading original | separated map");
	    var racedata = trackCodeContent.split("|")[0].trim().split(" ");
	    var material = new THREE.MeshLambertMaterial({color: new THREE.Color(0xf48342)});
	    map = new THREE.Object3D();
	    for(var i = 0; i < racedata.length; i++){
		    if(racedata[i] == "")
			    continue;
		    var point1 = new THREE.Vector2(parseInt(racedata[i].split("/")[0].split(",")[0]), parseInt(racedata[i].split("/")[0].split(",")[1]));
		    var point2 = new THREE.Vector2(parseInt(racedata[i].split("/")[1].split(",")[0]), parseInt(racedata[i].split("/")[1].split(",")[1]));
		    var wall = new THREE.Mesh(
			    new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale + 0.3, 1.5, 0.3),
			    material
		    );
		    var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
		    wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0.75, (point1.y + point2.y) / 2 * mapscale);
		    wall.rotation.set(0, angle, 0, "YXZ");
		    var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
		    wall.plane = plane;
		    wall.width = point1.distanceTo(point2) * mapscale;
		    wall.p1 = point1.multiply(new THREE.Vector2(-mapscale, mapscale));
		    wall.p2 = point2.multiply(new THREE.Vector2(-mapscale, mapscale));
		    wall.castShadow = true;
		    wall.receiveShadow = true;
		    map.add(wall);
	    }
	    scene.add(map);
	
	    trees = new THREE.Object3D();
	    var tree = new THREE.Mesh(
		    new THREE.CylinderBufferGeometry(0, 4, 15),
		    new THREE.MeshLambertMaterial({color: new THREE.Color("#1bad2c")})
	    );
	    var treedata = trackCodeContent.split("|")[2].trim().split(" ");
	    for(var i = 0; i < treedata.length; i++){
		    if(treedata[i] == "")
			    continue;
		    var t = tree.clone();
		    t.position.set(-parseInt(treedata[i].split(",")[0]) * mapscale, 0, parseInt(treedata[i].split(",")[1]) * mapscale);
		    var s = Math.random() + 1;
		    t.scale.set(s, s, s);
		    t.castShadow = true;
		    t.receiveShadow = true;
		    trees.add(t);
	    }
	    scene.add(trees);
	
	    signs = new THREE.Object3D();
	    var sign = new THREE.Mesh(
		    new THREE.ConeBufferGeometry(0.7, 2, 5),
		    new THREE.MeshLambertMaterial({color: new THREE.Color("#f00")})
	    );
	    var signdata = trackCodeContent.split("|")[3].trim().split(" ");
	    for(var i = 0; i < signdata.length; i++){
		    if(signdata[i] == "")
			    continue;
		    var s = sign.clone();
		    var da = signdata[i].split("/");
		    s.position.set(-parseFloat(da[0].split(",")[0]) * mapscale, parseFloat(da[0].split(",")[1]) + 1, parseFloat(da[0].split(",")[2]) * mapscale);
		    s.rotation.set(Math.PI / 2, parseInt(da[1]) / 180 * Math.PI, 0, "YXZ");
		    s.castShadow = true;
		    s.receiveShadow = true;
		    signs.add(s);
	    }
	    scene.add(signs);
	
	    var startdata = trackCodeContent.split("|")[1].trim().split(" ");
	    startc = new THREE.Object3D();
	    for(var i = 0; i < startdata.length; i++){
		    if(startdata[i] == "")
			    continue;
		    var point1 = new THREE.Vector2(parseInt(startdata[i].split("/")[0].split(",")[0]), parseInt(startdata[i].split("/")[0].split(",")[1]));
		    var point2 = new THREE.Vector2(parseInt(startdata[i].split("/")[1].split(",")[0]), parseInt(startdata[i].split("/")[1].split(",")[1]));
		    var wall = new THREE.Mesh(
			    new THREE.BoxBufferGeometry(point1.distanceTo(point2) * mapscale, 0.1, 1),
			    new THREE.MeshLambertMaterial({color: new THREE.Color(i == 0 ? "#2580db" : "#db2525")})
		    );
		    var angle = Math.atan2((point1.y - point2.y), (point1.x - point2.x));
		    wall.position.set(-(point1.x + point2.x) / 2 * mapscale, 0, (point1.y + point2.y) / 2 * mapscale);
		    wall.rotation.set(0, angle, 0, "YXZ");
		    var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle));
		    wall.plane = plane;
		    wall.width = point1.distanceTo(point2) * mapscale;
		    wall.castShadow = true;
		    wall.receiveShadow = true;
		    startc.add(wall);
	    }
	    scene.add(startc);
    }

    // --- COMMON SCENE OBJECTS (for all map types) ---
	main = new THREE.Object3D();

	var stripes = new THREE.TextureLoader().load("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAEklEQVQYV2NgYGD4z/D/////AA/6BPwHejn9AAAAAElFTkSuQmCC");
	stripes.magFilter = THREE.NearestFilter;
	stripes.wrapS = THREE.RepeatWrapping;
	stripes.wrapT = THREE.RepeatWrapping;
	stripes.repeat.set(100, 100);
	var ground = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(1000, 1000),
		new THREE.MeshLambertMaterial({color: new THREE.Color(0x57c115), emissive: new THREE.Color(0x0f0f0f), emissiveMap: stripes})
	);
	ground.rotation.set(-Math.PI / 2, 0, 0);
	ground.receiveShadow = true;
	main.add(ground);
	
	for(var i = 0; i < 100; i++){
		var cube = new THREE.Mesh(
			new THREE.BoxBufferGeometry(100, 100, 100),
			new THREE.MeshLambertMaterial({color: new THREE.Color("#888"), side: THREE.DoubleSide})
		);
		var dist = Math.random() * MOUNTAIN_DIST + MOUNTAIN_DIST;
		var dir = Math.random() * Math.PI * 2;
		cube.position.set(dist * Math.sin(dir), 0, dist * Math.cos(dir));
		cube.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
		main.add(cube);
	}
	scene.add(main);

    // Parse the settings string *from the loaded map*
    // This will eval() the code, setting the global vars
    var settingsString = trackCodeContent.split("|")[4];
    if (settingsString) {
        try {
	        eval(settingsString);
            console.log("Executed map settings:", settingsString);
        } catch (e) {
            console.error("Error executing map settings:", e);
        }
    }
}


function refreshMap(newMapString) {
    // 1. Update the trackcode div
    document.getElementById("trackcode").innerHTML = newMapString;
    
    // 2. Delete all map objects in scene
    deleteMap();

    // 3. Load the new map fresh
    loadMap();

    console.log("Map refreshed and old data cleared.");
}


function join(){
	loadMap(); // Changed: No longer need to eval, loadMap handles it
	
	scene.background = new THREE.Color(0x7fb0ff);
	
	camera = new THREE.PerspectiveCamera(
		90,
		window.innerWidth / window.innerHeight,
		1,
		1000
	);
	
	camera.position.set(0, 3, 10);
	scene.add(camera);
	
	var player = new THREE.Object3D();
	player.position.set(0, 0, 0);
	
	camera.lookAt(player.position);
	
	scene.add(player);
	
	var light = new THREE.DirectionalLight(0xffffff, 0.7);
	light.position.set(3000, 2000, -2000);
	light.castShadow = true;
	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;
	light.shadow.camera.near = 3000;
	light.shadow.camera.far = 5000;
	light.shadow.camera.top = 100;
	light.shadow.camera.bottom = -100;
	light.shadow.camera.left = -100;
	light.shadow.camera.right = 120;
	light.shadow.bias = 0.00002;
	scene.add(light);
	scene.add(new THREE.AmbientLight(0xffffff, 0.5));
	
	//scene.add(new THREE.AmbientLight(0x404040));
	
	var x = 0;
	var ray = new THREE.Raycaster();
	function toXYCoords(pos){
		pos = pos.clone();
		pos.y += 0.5;
		var vector = pos.project(camera);
		vector.x = (vector.x + 1) / 2 * window.innerWidth;
		vector.y = -(vector.y - 1) / 2 * window.innerHeight;
		return vector;
	}
	var windowsize = {x: window.innerWidth, y: window.innerHeight};
	
	var ray = new THREE.Raycaster();
	ray.near = 0;
	ray.far = 1;
	
	var ren = renderer;
	var controls;
	if(VR){
		var effect = new THREE.StereoEffect(renderer);
		effect.setSize(window.innerWidth, window.innerHeight);
		effect.setEyeSeparation(0.7);
		ren = effect;
		controls = new THREE.DeviceOrientationControls(camera);
	}
	
	var lastTime = performance.now();
	function render(timestamp) {
		requestAnimationFrame(render);
		var timepassed = timestamp - lastTime;
		lastTime = timestamp;

		// fixed
		if (timepassed > 250) {
			timepassed = 250;
		}
		// --- END FIX ---

		var warp = timepassed / 16;
		
		if(gameStarted){
			if(!mobile){
				if(left)
					me.data.steer = Math.PI / 6;
				if(right)
					me.data.steer = -Math.PI / 6;
				if(!(left ^ right))
					me.data.steer = 0;
			}
			if(VR)
				me.data.steer = camera.rotation.z;
			me.data.steer = Math.max(-Math.PI / 6, Math.min(Math.PI / 6, me.data.steer));
			
			players[me.ref.path.pieces_[2]].data = me.data;
			
			if(!gameSortaStarted){
				for(var p in players){
					var play = players[p];
					
					play.data.dir += play.data.steer / 10 * warp;
					
					play.data.xv += Math.sin(play.data.dir) * SPEED * warp;
					play.data.yv += Math.cos(play.data.dir) * SPEED * warp;
					
					play.data.xv *= Math.pow(0.99, warp);
					play.data.yv *= Math.pow(0.99, warp);
					
					play.data.x += play.data.xv * warp;
					play.data.y += play.data.yv * warp;
					
					play.model.position.x = play.data.x + play.data.xv;
					play.model.position.z = play.data.y + play.data.yv;
					play.model.rotation.y = play.data.dir;
					
					play.model.children[0].rotation.z = Math.PI / 2 - play.data.steer;
					play.model.children[1].rotation.z = Math.PI / 2 - play.data.steer;
					
					for(var w in map.children){
						var wall = map.children[w];
						var posi = new THREE.Vector2(play.data.x, play.data.y);
						if(Math.abs(wall.plane.distanceToPoint(play.model.position.clone().sub(wall.position))) < WALL_SIZE){
							if(wall.position.clone().distanceTo(play.model.position) < wall.width / 2){
								var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
								vel.reflect(wall.plane.normal);
								play.data.xv = vel.x + BOUNCE_CORRECT * wall.plane.normal.x * Math.sign(wall.plane.normal.dot(play.model.position.clone().sub(wall.position)));
								play.data.yv = vel.z + BOUNCE_CORRECT * wall.plane.normal.z * Math.sign(wall.plane.normal.dot(play.model.position.clone().sub(wall.position)));
								//var dir = Math.normalize();
								while(Math.abs(wall.plane.distanceToPoint(new THREE.Vector3(play.data.x, 0, play.data.y).sub(wall.position))) < WALL_SIZE){
									play.data.x += play.data.xv;
									play.data.y += play.data.yv;
								}
								play.data.xv *= BOUNCE;
								play.data.yv *= BOUNCE;
							}
						}
						if(posi.distanceTo(wall.p1) < WALL_SIZE + 0.1){
							// console.log("o1");
							var norm = posi.clone().sub(wall.p1);
							norm = new THREE.Vector3(norm.x, 0, norm.y);
							norm.normalize();
							var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
							vel.reflect(norm);
							play.data.xv = vel.x + norm.x * BOUNCE_CORRECT * 1;
							play.data.yv = vel.z + norm.z * BOUNCE_CORRECT * 1;
							while((new THREE.Vector2(play.data.x, play.data.y)).distanceTo(wall.p1) < WALL_SIZE + 0.1){
								play.data.x += play.data.xv;
								play.data.y += play.data.yv;
							}
							play.data.xv *= BOUNCE;
							play.data.yv *= BOUNCE;
						}
						if(posi.distanceTo(wall.p2) < WALL_SIZE + 0.1){
							// console.log("o2");
							var norm = posi.clone().sub(wall.p2);
							norm = new THREE.Vector3(norm.x, 0, norm.y);
							norm.normalize();
							var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
							vel.reflect(norm);
							play.data.xv = vel.x + norm.x * BOUNCE_CORRECT * 1;
							play.data.yv = vel.z + norm.z * BOUNCE_CORRECT * 1;
							while((new THREE.Vector2(play.data.x, play.data.y)).distanceTo(wall.p2) < WALL_SIZE + 0.1){
								play.data.x += play.data.xv;
								play.data.y += play.data.yv;
							}
							play.data.xv *= BOUNCE;
							play.data.yv *= BOUNCE;
						}
					}
					
					for(var i in startc.children){
						var cp = startc.children[i];
						if(Math.abs(cp.plane.distanceToPoint(play.model.position.clone().sub(cp.position))) < 1){
							if(cp.position.clone().distanceTo(play.model.position) < cp.width / 2 + 1){
								// console.log(i);
								if(i == 0){
									if(play.data.checkpoint == 1){
										play.data.checkpoint = 0;
										play.data.lap++;
									}
								}else
									play.data.checkpoint = 1;
							}
						}
					}
					
					if (play.data.lap > LAPS && document.getElementById("countdown").innerHTML == "") {
    document.getElementById("countdown").style.fontSize = "25vmin";
    document.getElementById("countdown").innerHTML = play.data.name.replaceAll("<", "&lt;") + " Won!";

    if (!document.getElementById("main-menu-btn")) {

        var menuBtn = document.createElement("DIV");

        menuBtn.id = "main-menu-btn";
        menuBtn.className = "menuitem title button";
        menuBtn.innerHTML = "Main Menu";
        menuBtn.onclick = function() {
            refreshgame();
        };
        menuBtn.setAttribute("ontouchstart", "this.click()");

        // --- Simplified Styles ---
        // We only set the *base* position. The new CSS rule will handle the hover.
        menuBtn.style.position = "absolute";
        menuBtn.style.top = "70vh";
        menuBtn.style.left = "50%";
        menuBtn.style.transform = "translateX(-50%)"; // Set initial centered state
        menuBtn.style.zIndex = "100001";
        
        // NO onmouseover or onmouseout needed.

        f.appendChild(menuBtn);
    }
}
					
					
					for(var pl in players){
						if(play != players[pl] && play.model.position.distanceTo(players[pl].model.position) < 2){
							var ply = players[pl];
							var temp = new THREE.Vector2(play.data.xv, play.data.yv);
							var temp2 = new THREE.Vector2(ply.data.xv, ply.data.yv);
							ply.data.xv -= temp.x;
							ply.data.yv -= temp.y;
							play.data.xv -= temp2.x;
							play.data.yv -= temp2.y;
							var norm = (new THREE.Vector2(play.data.x, play.data.y)).sub(new THREE.Vector2(ply.data.x, ply.data.y));
							norm = new THREE.Vector3(norm.x, 0, norm.y);
							norm.normalize();
							var vel = new THREE.Vector3(play.data.xv, 0, play.data.yv);
							var vel2 = new THREE.Vector3(ply.data.xv, 0, ply.data.yv);
							vel.reflect(norm);
							vel2.reflect(norm);
							ply.data.xv += COLLISION * vel2.x;
							ply.data.yv += COLLISION * vel2.z;
							play.data.xv += COLLISION * vel.x;
							play.data.yv += COLLISION * vel.z;
							ply.data.xv += temp.x;
							ply.data.yv += temp.y;
							play.data.xv += temp2.x;
							play.data.yv += temp2.y;
							while((new THREE.Vector2(play.data.x, play.data.y)).distanceTo(new THREE.Vector2(ply.data.x, ply.data.y)) < 2){
								play.data.x += play.data.xv;
								play.data.y += play.data.yv;
							}
						}
					}
					
					if(play.model.position.distanceTo(new THREE.Vector3()) > OOB_DIST){
						play.data.x = 0;
						play.data.y = 0;
					}
				}
			}
			
			var target = new THREE.Vector3(
				me.model.position.x + Math.sin(-me.model.rotation.y) * 5,
				3,
				me.model.position.z + -Math.cos(-me.model.rotation.y) * 5
			);
			camera.position.set(
				camera.position.x * Math.pow(CAMERA_LAG, warp) + target.x * (1 - Math.pow(CAMERA_LAG, warp)),
				3,
				camera.position.z * Math.pow(CAMERA_LAG, warp) + target.z * (1 - Math.pow(CAMERA_LAG, warp))
			);
			camera.lookAt(me.model.position);
			
			// --- Only send changed fields to Firebase ---
if (me && me.ref && me.data) {
  if (!me.lastSentData) me.lastSentData = {}; // store previous snapshot
  const diff = {};

  // Compare each key to last sent value
  for (const key in me.data) {
    const val = me.data[key];
    if (me.lastSentData[key] !== val) {
      diff[key] = val;
      me.lastSentData[key] = val;
    }
  }

  // Only push if there’s at least one difference
  if (Object.keys(diff).length > 0) {
    me.ref.update(diff);
  }
}

			
			lap.innerHTML = me.data.lap <= LAPS ? me.data.lap + "/" + LAPS : "";
		}else{
			camera.position.set(50 * Math.sin(x), 20, 50 * Math.cos(x));
			camera.lookAt(player.position);
		}
		
		x += 0.01;
		
		camera.updateMatrix();
		camera.updateMatrixWorld();
		camera.updateProjectionMatrix();
		var frustum = new THREE.Frustum();
		frustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
		for(var i = 0; i < labels.length; i++){
			var label = labels[i];
			if(frustum.containsPoint(label.position) && !VR){
				var vec = toXYCoords(label.position);
				label.style.left = vec.x + "px";
				label.style.top = vec.y + "px";
				label.style.zIndex = 99999 - Math.floor(camera.position.distanceTo(label.position) * 10);
				label.style.display = "inline-block";
			}else
				label.style.display = "none";
		}
		
		if(windowsize.x != window.innerWidth || windowsize.x != window.innerHeight){
			windowsize = {x: window.innerWidth, y: window.innerHeight};
			onWindowResize();
		}
		
		if(VR){
			var a = camera.rotation.y;
			controls.update();
			camera.rotation.y += a - Math.PI / 2;
		}
		ren.render(scene, camera);
		MODS();
	}
	
	render(performance.now());
	
	window.addEventListener("resize", onWindowResize, false);
	window.addEventListener("orientationchange", onWindowResize, false);

	function onWindowResize(){
		function orientCamera(){
			camera.aspect = window.innerWidth / window.innerHeight;
			renderer.setSize(window.innerWidth, window.innerHeight);
		}
		orientCamera();
		setTimeout(orientCamera, 0);
	}
}
codeCheck = function(){
	var incode = document.getElementById("incode");
	if(incode.value.length == 4){
		incode.onkeyup = null;
		code = incode.value.toUpperCase();
		database.ref(code).once("value", function(cc){
			if(typeof cc.val() != "undefined" && cc.val() != null && cc.val().status === 0){
				document.getElementsByClassName("info")[0].innerHTML = "<div class='info title'>Waiting for the game to start...<div id='code'>" + code + "</div></div>";
				var playerCount = 0;
				for(var p in cc.val().players){
					playerCount++;
					console.log(p);
					players[p] = {
						data: cc.val().players[p],
						model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
					};
					var pl = players[p];
					pl.model.position.set(pl.data.x, 0.6, pl.data.y);
					pl.model.material = new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
					var wheel = new THREE.Mesh(
						new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
						new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
					);
					var w1 = wheel.clone();
					w1.position.set(0.6, -0.1, 0.7);
					w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w1);
					var w2 = wheel.clone();
					w2.position.set(-0.6, -0.1, 0.7);
					w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w2);
					var w3 = wheel.clone();
					w3.position.set(0.6, -0.1, -0.7);
					w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w3);
					var w4 = wheel.clone();
					w4.position.set(-0.6, -0.1, -0.7);
					w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
					pl.model.add(w4);
					var label = document.createElement("DIV");
					label.className = "label";
					label.innerHTML = pl.data.name.replaceAll("<", "&lt;").substring(0, 50) + "<br/>|";
					pl.label = label;
					label.position = pl.model.position;
					console.log(label);
					f.appendChild(label);
					labels.push(label);
					pl.model.receiveShadow = true;
					scene.add(pl.model);
				}
				database.ref(code + "/players").on("child_added", function(p){
					if(typeof players[p.ref_.path.pieces_[2]] == "undefined"){
						console.log(p);
						players[p.ref_.path.pieces_[2]] = {
							data: p.val(),
							model: new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 2))
						};
						var pl = players[p.ref_.path.pieces_[2]];
						pl.model.position.set(pl.data.x, 0.6, pl.data.y);
						pl.model.material = new THREE.MeshLambertMaterial({color: new THREE.Color("hsl(" + pl.data.color + ", 100%, 50%)")});
						var wheel = new THREE.Mesh(
							new THREE.CylinderBufferGeometry(0.5, 0.5, 0.2, 10),
							new THREE.MeshLambertMaterial({color: new THREE.Color("#222")})
						);
						var w1 = wheel.clone();
						w1.position.set(0.6, -0.1, 0.7);
						w1.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w1);
						var w2 = wheel.clone();
						w2.position.set(-0.6, -0.1, 0.7);
						w2.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w2);
						var w3 = wheel.clone();
						w3.position.set(0.6, -0.1, -0.7);
						w3.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w3);
						var w4 = wheel.clone();
						w4.position.set(-0.6, -0.1, -0.7);
						w4.rotation.set(Math.PI / 2, 0, Math.PI / 2);
						pl.model.add(w4);
						var label = document.createElement("DIV");
						label.className = "label";
						label.innerHTML = pl.data.name.replaceAll("<", "&lt;").substring(0, 50) + "<br/>|";
						pl.label = label;
						label.position = pl.model.position;
						console.log(label);
						f.appendChild(label);
						labels.push(label);
						pl.model.receiveShadow = true;
						scene.add(pl.model);
						
						if(p.ref_.path.pieces_[2] == me.ref.path.pieces_[2]){
							me.label = pl.label;
							me.model = pl.model;
							me.label.innerHTML = "";
						}
					}
				});
				
				database.ref(code + "/players").on("child_changed", function (p) {
  const id = p.ref_.path.pieces_[2];
  const pl = players[id];
  const newData = p.val();

  if (!pl || !newData) return;

  // Merge server updates into local data
  Object.assign(pl.data, newData);

  // 🔹 Update car color live
  if (pl.model && typeof newData.color !== "undefined") {
    pl.model.material.color = new THREE.Color(
      "hsl(" + newData.color + ", 100%, 50%)"
    );
  }

  // 🔹 Update name label
  if (pl.label && typeof newData.name === "string") {
    pl.label.innerHTML = newData.name.replaceAll("<", "&lt;") + "<br/>|";
  }

  // 🔹 If this client is the one being updated, reflect changes locally too
  if (me && me.ref && me.ref.path && me.ref.path.pieces_[2] === id) {
    if (typeof newData.color !== "undefined" && me.model) {
      me.model.material.color = new THREE.Color(
        "hsl(" + newData.color + ", 100%, 50%)"
      );
    }
    if (typeof newData.name === "string" && me.label) {
      me.label.innerHTML = newData.name.replaceAll("<", "&lt;") + "<br/>|";
    }
    ["checkpoint", "lap"].forEach((key) => {
      if (typeof newData[key] !== "undefined") {
        me.data[key] = newData[key];
      }
    });
  }
});
				console.log("playerCount: " + playerCount);
				me.ref = database.ref(code + "/players").push();
				me.data = {
					x: carPos[playerCount].x,
					y: carPos[playerCount].y,
					xv: 0,
					yv: 0,
					dir: 0,
					steer: 0,
					color: color,
					name: name,
					checkpoint: 1,
					lap: 0,
					collision: {}
				}
				// --- Only send changed fields to Firebase ---
if (me && me.ref && me.data) {
  if (!me.lastSentData) me.lastSentData = {}; // store previous snapshot
  const diff = {};

  // Compare each key to last sent value
  for (const key in me.data) {
    const val = me.data[key];
    if (me.lastSentData[key] !== val) {
      diff[key] = val;
      me.lastSentData[key] = val;
    }
  }

  // Only push if there’s at least one difference
  if (Object.keys(diff).length > 0) {
    me.ref.update(diff);
  }
}
				
				database.ref(code + "/status").on("value", function(v){
					v = v.val();
					if(v == 1){
						document.getElementsByClassName("info")[0].outerHTML = "";
						
						gameStarted = true;
						gameSortaStarted = true;
						
						var countDown = document.createElement("DIV");
						countDown.innerHTML = "3";
						countDown.className = "title";
						countDown.id = "countdown";
						f.appendChild(countDown);
						
						lap = document.createElement("DIV");
						lap.innerHTML = "1/3";
						lap.className = "title";
						lap.id = "lap";
						f.appendChild(lap);
						
						setTimeout(function(){
							countDown.innerHTML = "2";
						}, 1000);
						
						setTimeout(function(){
							countDown.innerHTML = "1";
						}, 2000);
						
						setTimeout(function(){
							countDown.innerHTML = "GO!";
							gameSortaStarted = false;
						}, 3000);
						
						setTimeout(function(){
							countDown.innerHTML = "";
						}, 4000);
					}
				});
				database.ref(code + "/map").once("value", function(e){
					// When joining, the map is set by the host.
                    // We just need to load it.
                    refreshMap(e.val());
				});
			}else
				incode.onkeyup = codeCheck;
		});
	}else{
		incode.onkeyup = codeCheck;
		if(incode.value.length > 4)
			incode.value = incode.value.substring(0, 4);
	}
}

function startGame(){
	database.ref(code + "/status").set(1);
}

function startMenu() {
	alert("in development 🤫🤫🤫")
}

// --- NEW HOST SETTINGS MENU ---

// Function to open the new host settings menu
function openHostMenu() {
    // 1. Create the overlay
    const overlay = document.createElement('div');
    overlay.className = 'host-modal-overlay';
    
    // 2. Create the menu
    const menu = document.createElement('div');
    menu.className = 'host-settings-menu title'; // Use 'title' class to get Monoton font

    // 3. Create the title (smaller)
    const title = document.createElement('h3');
    title.textContent = 'Host Game Settings';

    // 4. Create the content area
    const content = document.createElement('div');
    content.className = 'host-settings-content';

    // 5. Create Map Selection Area
    const mapSelection = document.createElement('div');
    mapSelection.id = 'map-selection-area';
    
    PRESET_MAPS.forEach(map => {
        const mapButton = document.createElement('button');
        mapButton.className = 'map-preset-button title';
        mapButton.title = map.description;
        mapButton.dataset.mapId = map.id;
        mapButton.onclick = () => selectMapPreset(map.id);

        // Add Image
        const mapImg = document.createElement('img');
        mapImg.src = map.image_url;
        // Handle broken images
        mapImg.onerror = () => { mapImg.style.display = 'none'; };
        mapButton.appendChild(mapImg);

        // Add Text
        const mapName = document.createElement('span');
        mapName.textContent = map.name;
        mapButton.appendChild(mapName);
        
        mapSelection.appendChild(mapButton);
    });

    const customMapButton = document.createElement('button');
    customMapButton.className = 'map-preset-button title';
    customMapButton.textContent = 'Custom Map';
    customMapButton.dataset.mapId = 'custom';
    customMapButton.onclick = selectCustomMap;
    mapSelection.appendChild(customMapButton);

    // 6. Create Settings Grid
    const settingsGrid = document.createElement('div');
    settingsGrid.id = 'settings-grid';

    // Get default values from the currently selected map or global vars
    const defaults = (menuSelectedMap && menuSelectedMap !== "custom") ? menuSelectedMap : {
        default_speed: SPEED,
        default_bounce: BOUNCE,
        default_laps: LAPS,
        default_mountain: MOUNTAIN_DIST,
        default_oob: OOB_DIST
    };

    settingsGrid.innerHTML = `
        <label for="host-speed">Speed:</label>
        <input type="number" id="host-speed" class="title" value="${defaults.default_speed}" step="0.001" min="0.001">
        
        <label for="host-bounce">Bounce:</label>
        <div class="bounce-slider-container">
            <input type="range" id="host-bounce" value="${defaults.default_bounce}" min="0" max="1" step="0.1" oninput="document.getElementById('host-bounce-value').textContent = this.value">
            <span id="host-bounce-value" class="title">${defaults.default_bounce}</span>
        </div>
        
        <label for="host-laps">Laps:</label>
        <input type="number" id="host-laps" class="title" value="${defaults.default_laps}" step="1" min="1">
        
        <label for="host-mountain">Mountain Dist:</label>
        <input type="number" id="host-mountain" class="title" value="${defaults.default_mountain}" step="25" min="50">
        
        <label for="host-oob">OOB Dist:</label>
        <input type="number" id="host-oob" class="title" value="${defaults.default_oob}" step="25" min="50">
    `;

    // 7. Create Custom Map Text Area (hidden by default)
    const customMapText = document.createElement('textarea');
    customMapText.id = 'custom-map-input';
    customMapText.className = 'title';
    customMapText.placeholder = 'Paste your full map code here...';
    customMapText.oninput = parseCustomMapInput;

    // 8. Create the button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'host-menu-buttons';

    // 9. Create the Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.className = 'host-menu-button title cancel'; // Use 'title' class
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = closeHostMenu;

    // 10. Create the Continue button
    const continueButton = document.createElement('button');
    continueButton.className = 'host-menu-button title continue'; // Use 'title' class
    continueButton.textContent = 'Continue';
    continueButton.onclick = applyHostSettingsAndHost;

    // 11. Put the buttons in their container
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(continueButton);

    // 12. Put all elements into the content area
    content.appendChild(mapSelection);
    content.appendChild(settingsGrid);
    content.appendChild(customMapText);
    
    // 13. Put all elements into the menu
    menu.appendChild(title);
    menu.appendChild(content);
    menu.appendChild(buttonContainer);

    // 14. Put the menu into the overlay
    overlay.appendChild(menu);

    // 15. Add the overlay to the page
    document.body.appendChild(overlay);
    
    // 16. Set initial active button
    updateActiveMapButton();
    
    // 17. Trigger the "show" animation
    setTimeout(() => {
        overlay.classList.add('visible');
    }, 10); // Tiny delay to allow CSS to apply initial state
}

// Function to close the new host settings menu
function closeHostMenu() {
    const overlay = document.querySelector('.host-modal-overlay');
    if (overlay) {
        overlay.classList.remove('visible');
        overlay.addEventListener('transitionend', () => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, { once: true });
    }
}

// --- HOST MENU HELPER FUNCTIONS ---

function selectMapPreset(mapId) {
    const map = PRESET_MAPS.find(m => m.id === mapId);
    if (!map) return;
    
    menuSelectedMap = map;

    // Update UI fields
    document.getElementById('host-speed').value = map.default_speed;
    document.getElementById('host-bounce').value = map.default_bounce;
    document.getElementById('host-bounce-value').textContent = map.default_bounce;
    document.getElementById('host-laps').value = map.default_laps;
    document.getElementById('host-mountain').value = map.default_mountain;
    document.getElementById('host-oob').value = map.default_oob;
    
    // Hide custom map text
    document.getElementById('custom-map-input').style.display = 'none';

    updateActiveMapButton();
}

function selectCustomMap() {
    menuSelectedMap = "custom";
    
    // Show custom map text
    document.getElementById('custom-map-input').style.display = 'block';

    // Reset fields to global defaults
    document.getElementById('host-speed').value = SPEED;
    document.getElementById('host-bounce').value = BOUNCE;
    document.getElementById('host-bounce-value').textContent = BOUNCE;
    document.getElementById('host-laps').value = LAPS;
    document.getElementById('host-mountain').value = MOUNTAIN_DIST;
    document.getElementById('host-oob').value = OOB_DIST;

    updateActiveMapButton();
}

function updateActiveMapButton() {
    const buttons = document.querySelectorAll('.map-preset-button');
    buttons.forEach(btn => {
        let btnId = btn.dataset.mapId;
        if (menuSelectedMap === "custom" && btnId === "custom") {
            btn.classList.add('active');
        } else if (typeof menuSelectedMap === 'object' && btnId === menuSelectedMap.id) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// This function reads the custom map text and updates the UI
function parseCustomMapInput(event) {
    const text = event.target.value;
    const parts = text.split('|');
    if (parts.length > 4) {
        // The 5th part (index 4) is the settings string
        updateMenuFromSettingsString(parts[4]);
    }
}

// This parses the settings string (e.g., "SPEED*=2;BOUNCE=0.5;")
function updateMenuFromSettingsString(settingsString) {
    if (!settingsString || settingsString.trim() === "eval()") return;

    // This is the base speed to be used for multipliers.
    // We check if a preset is selected, otherwise we use the global default.
    const baseSpeed = (menuSelectedMap && menuSelectedMap !== "custom") 
                      ? menuSelectedMap.default_speed 
                      : SPEED;

    const settings = settingsString.split(';');
    settings.forEach(setting => {
        
        if (setting.includes('SPEED*=')) {
            let multiplier = parseFloat(setting.split('=')[1]);
            if (!isNaN(multiplier)) {
                document.getElementById('host-speed').value = (baseSpeed * multiplier).toFixed(4);
            }
        } else if (setting.includes('SPEED=')) {
            let val = parseFloat(setting.split('=')[1]);
            if (!isNaN(val)) {
                document.getElementById('host-speed').value = val.toFixed(4);
            }
        } else if (setting.includes('BOUNCE=')) {
            let val = parseFloat(setting.split('=')[1]);
            if (!isNaN(val)) {
                document.getElementById('host-bounce').value = val;
                document.getElementById('host-bounce-value').textContent = val;
            }
        } else if (setting.includes('LAPS=')) {
            let val = parseInt(setting.split('=')[1]);
            if (!isNaN(val)) {
                document.getElementById('host-laps').value = val;
            }
        } else if (setting.includes('MOUNTAIN_DIST=')) {
            let val = parseInt(setting.split('=')[1]);
            if (!isNaN(val)) {
                document.getElementById('host-mountain').value = val;
            }
        } else if (setting.includes('OOB_DIST=')) {
            let val = parseInt(setting.split('=')[1]);
            if (!isNaN(val)) {
                document.getElementById('host-oob').value = val;
            }
        }
    });
}


// This is called by the "Continue" button
function applyHostSettingsAndHost() {
    // 1. Apply settings from UI to global variables
    LAPS = parseInt(document.getElementById('host-laps').value);
    SPEED = parseFloat(document.getElementById('host-speed').value);
    BOUNCE = parseFloat(document.getElementById('host-bounce').value);
    MOUNTAIN_DIST = parseInt(document.getElementById('host-mountain').value);
    OOB_DIST = parseInt(document.getElementById('host-oob').value);

    // 2. Set the map code in #trackcode
    if (menuSelectedMap === "custom") {
        let fullMapCode = document.getElementById('custom-map-input').value;
        if (fullMapCode.trim() === "") {
            alert("Custom map code cannot be empty!");
            return;
        }
        
        // We set the *full* code, including the settings string,
        // so that loadMap() can parse it.
        document.getElementById('trackcode').innerHTML = fullMapCode;

    } else if (menuSelectedMap) {
        // It's a preset map object
        document.getElementById('trackcode').innerHTML = menuSelectedMap.map_code;
    }
    // If menuSelectedMap is somehow null, it'll just use the last loaded map

    // 3. Close menu and call host()
    closeHostMenu();
    host(); // Call the original host function
}

// --- END OF NEW HOST SETTINGS MENU ---


function refreshgame() {
    window.location.reload(); 
}

// wasd/arrow controls
window.onkeydown = function(e){
    if(e.keyCode == 37 || e.keyCode == 65) 
        left = true;
    if(e.keyCode == 39 || e.keyCode == 68) 
        right = true;
}

window.onkeyup = function(e){
    if(e.keyCode == 37 || e.keyCode == 65)
        left = false;
    if(e.keyCode == 39 || e.keyCode == 68) 
        right = false;
}

if(mobile){
   
}

document.body.onkeydown = function(e){
	if(e.keyCode == 73 && (e.ctrlKey || e.metaKey))
		document.getElementById("trackcode").innerText = prompt("You can also input track data in the host settings menu, this feature will soon be deprecated")
}
