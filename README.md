# TUI Holidays Web Scraper

## What is it? 
This web scraper was built to coincide with another project. It's designed to scrape the TUI Holidays Deals webpage where it gathers an array of href links for package holidays. It then cycles through each of those links, opens the webpage based on the link and gatheres a bunch of information found by CSS selectors.

## Work in progress
Currently there is no support for navigating through pagination. However, it is being worked on.  

## What's it built on?
At present the script is built on two packages: 
- [PhantomJS](http://phantomjs.org/)
- [CasperJS](http://casperjs.org/)
 
