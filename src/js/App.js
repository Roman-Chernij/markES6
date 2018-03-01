function App() {
	this.init();
}




App.prototype = Object.create(Helper.prototype);
App.prototype.init = function () {
  new Mmenu();
}

window.addEventListener( "DOMContentLoaded", function() {
	new App();
});

import './jquery-3.1.1.min.js';

import {rr} from './Helper.js';


console.log(rr);
console.log($);