var casper = require('casper').create({
    // verbose: true,
    // logLevel: "debug"
});
// opens tuiholidays deals page 
casper.start('https://www.tuiholidays.ie/f/deals/summer-holidays');
casper.run();
var fs = require('fs');

console.log("Loading script...");
var links = [];
var products = [];
var evaluatedLinks = [];
var evaluatedPackages = [];

// find hrefs and add them to array
function getLinks() {
	var links = document.querySelectorAll('ul.results-list li.c div.summary span a');
	return Array.prototype.map.call(links, function (e) {
		return e.getAttribute('href');
	});
}

casper.then(function() {
    for (var i=1; i <=3; i++) { // i <=int; is the number of pages to loop through
    	(function(i){
    		casper.wait(1500, function() {
    			if (!this.exists('.pagination .pages .next a.controls')) {
    				this.echo(i + " not available");
                    return; // if return - the following `thenClick()` is not executed
                }
                this.thenClick('.pagination .pages .next a.controls', function (){
                	casper.then(function() {
                		links = this.evaluate(getLinks);
                		console.log("gathered " + links.length  + " links from page " + i);
                		evaluatedLinks.push.apply(evaluatedLinks, links);
                	});
                });
            });
    	})(i);
    }
});

casper.then(function(){
	console.log("total number of collected links is " + evaluatedLinks.length);
	getData();
});

function getData(){
	console.log("collecting data...")
	casper.each(evaluatedLinks, function(self,url){
		self.thenOpen("https://www.tuiholidays.ie"+url,function(a){
			casper.wait(5000, function() {
				var product = this.evaluate(function(){
					var products = [];
					var product = {};
					var package_name = document.querySelector('.heading-section .pg-heading .dis-inblock h1').textContent;
					var location = document.querySelector('.heading-section .product-info .location span.pad-left-5').textContent.replace(/,/g, ''); 
					var price1 = document.querySelector('.part1').textContent;
					var price2 = document.querySelector('.part2').textContent;
					var price_pp = price1 + "." + price2;

					var description = document.querySelector('.copy').innerText.replace(/\s\s+/g, ' ');
					var source_name = document.title;
					var source_link = window.location.href;

					product['package_name'] = package_name;
					product['location'] = location;
					product['price_pp'] = price_pp;
					product['description'] = description;
					product['source_name'] = source_name;
					product['source_link'] = source_link;
					products.push(product);

					return JSON.stringify(product);
				});
				evaluatedPackages.push.call(evaluatedPackages, product);
				console.log("package details retrieved.");
			});
		});
	});
}
casper.then(function(){
	console.log(evaluatedPackages);
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var hours = currentTime.getHours();
	var minutes = currentTime.getMinutes();
	var myfile = "test-data-"+day + "-" + month + "-" + year+ "-" + hours + "-" + minutes + ".json";
	console.log("exporting data to file " + myfile);
	var jsonArray = [];
	Object.keys(evaluatedPackages).forEach(function(key) {
		console.log('\"package' + key + '\":' + evaluatedPackages[key]);
		var jsonEvaluatedPackages = '\"package' + key + '\":' + evaluatedPackages[key];
		jsonArray.push(jsonEvaluatedPackages);
		var formattedJsonArray = '{\"packages\"' + ':{' + jsonArray + '}}'
		fs.write(myfile, formattedJsonArray, 'w');
	})
	console.log("export complete!");
});


