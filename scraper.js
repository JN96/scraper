var casper = require('casper').create();
console.log("Loading script...");
var links = [];

// find hrefs and add them to array
function getLinks() {
	var links = document.querySelectorAll('ul.results-list li.c div.summary span a');
	return Array.prototype.map.call(links, function (e) {
		return e.getAttribute('href');
	});
}

// opens tuiholidays deals page 
casper.start('https://www.tuiholidays.ie/f/deals/summer-holidays');

// collect links from href and pass them into array
// open each link stored in the array and collect data found by css selectors
var getLinkData = casper.then(function () {
	links = this.evaluate(getLinks);
	console.log("gathering links - " + links.length + " links");
	casper.wait(500, function() {
		console.log("gathering scraped data...\n");
	});
	var getPageDetails = this.each(links,function(self,url){
		self.thenOpen("https://www.tuiholidays.ie"+url,function(a){
			casper.wait(500, function() {
				var details = this.evaluate(function(){
					var package_name = document.querySelector('.heading-section .pg-heading .dis-inblock h1').textContent;
					var location = document.querySelector('.heading-section .product-info .location span.pad-left-5').textContent;
					// var location_splice = location.replace(/^\&nbsp\;|<br?\>*/gi, " ").replace(/\&nbsp\;|<br?\>$/gi, " ").trim();
					// var country = document.querySelector('.heading-section .product-info .location span.pad-left-5').innerHTML;
					// var country_splice = " " + location_splice.split(" ").pop(); 
					var price1 = document.querySelector('.part1').textContent;
					var price2 = document.querySelector('.part2').textContent;
					var price_pp = price1 + "." + price2;

					var description = document.querySelector('.copy').textContent;
					var source_name = document.title;
					var source_link = window.location.href;

					return "package_name: " + package_name +
					"\nlocation: " + location +
					"\nprice_pp: " + price_pp +
					"\ndescription: " + description +
					"\nsource_name: " + source_name +
					"\nsource_link: " + source_link + "\n";

					// return [package_name, location, price_pp, description, source_name, source_link];
				});
				console.log(details);
			});
		});
	});
	// 	this.click('.pagination .pages .next a.controls');
});

casper.run(function () {
	casper.exit();
});