var casper = require('casper').create({
    // verbose: true,
    // logLevel: "debug"
});
// opens tuiholidays deals page 
casper.start('https://www.tuiholidays.ie/f/deals/summer-holidays');
casper.run();

console.log("Loading script...");
var links = [];
var products = [];
var evaluatedLinks = [];

// find hrefs and add them to array
function getLinks() {
    var links = document.querySelectorAll('ul.results-list li.c div.summary span a');
    return Array.prototype.map.call(links, function (e) {
        return e.getAttribute('href');
    });
}

casper.then(function() {
    for (var i=1; i <=2; i++) { // i <=int; is the number of pages to loop through
        (function(i){
            casper.wait(1000, function() {
                if (!this.exists('.pagination .pages .next a.controls')) {
                    this.echo(i + " not available");
                    // if return - the following `thenClick()` is not executed
                    return; 
                }
                this.thenClick('.pagination .pages .next a.controls', function (){
                    casper.then(function() {
                    links = this.evaluate(getLinks);
                    console.log("page " + i + " gathered " + links.length + " links");
                    evaluatedLinks.push.apply(evaluatedLinks, links);
                    });
                });
            });
        })(i);
    }
});
casper.then(function(){
    getData();
    console.log("evaluatedLinks is of length " + evaluatedLinks.length);
});

function getData(){
    casper.each(evaluatedLinks, function(self,url){
        self.thenOpen("https://www.tuiholidays.ie"+url,function(a){
            casper.wait(1500, function() {
                var products = this.evaluate(function(){
                    var products = [];
                    var product = {};
                    var package_name = document.querySelector('.heading-section .pg-heading .dis-inblock h1').textContent;
                    var location = document.querySelector('.heading-section .product-info .location span.pad-left-5').textContent; 
                    var price1 = document.querySelector('.part1').textContent;
                    var price2 = document.querySelector('.part2').textContent;
                    var price_pp = price1 + "." + price2;

                    var description = document.querySelector('.copy').innerText.replace(/\s\s+/g, ' ');;
                    var source_name = document.title;
                    var source_link = window.location.href;

                    product['package_name'] = package_name;
                    product['location'] = location;
                    product['price_pp'] = price_pp;
                    product['description'] = description;
                    product['source_name'] = source_name;
                    product['source_link'] = source_link;
                    products.push(product);

                    return JSON.stringify(products);
            });
                console.log(products);
            });
        });
    });
}