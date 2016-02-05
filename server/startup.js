/**
 * Created by albert.gracia on 05.02.2016.
 */
    // start up function that creates entries in the Websites databases.
Meteor.startup(function () {
    Meteor.methods({
        getUrlInfo: function (url) {
            return Scrape.website(addHttp(url));
        }
    });


    // code to run on server at startup
    if (!Websites.findOne()) {
        console.log("No websites yet. Creating starter data.");
        Websites.insert({
            title: "Goldsmiths Computing Department",
            url: "http://www.gold.ac.uk/computing/",
            description: "This is where this course was developed.",
            createdOn: new Date()
        });
        Websites.insert({
            title: "University of London",
            url: "http://www.londoninternational.ac.uk/courses/undergraduate/goldsmiths/bsc-creative-computing-bsc-diploma-work-entry-route",
            description: "University of London International Programme.",
            createdOn: new Date()
        });
        Websites.insert({
            title: "Coursera",
            url: "http://www.coursera.org",
            description: "Universal access to the world’s best education.",
            createdOn: new Date()
        });
        Websites.insert({
            title: "Google",
            url: "http://www.google.com",
            description: "Popular search engine.",
            createdOn: new Date()
        });
    }
});

var addHttp = function(url) {
    if (!/^(f|ht)tps?:\/\//i.test(url)) {
        url = "http://" + url;
    }
    return url;
}