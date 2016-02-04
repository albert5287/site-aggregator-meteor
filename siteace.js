Websites = new Mongo.Collection("websites");

function validUrl(str) {
    var url = addHttp(str);
    var pattern = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i; // fragment locater
    if(!(pattern.test(url))) {
        return false;
    } else {
        return true;
    }
}

function addHttp(url) {
    if (!/^(f|ht)tps?:\/\//i.test(url)) {
        url = "http://" + url;
    }
    return url;
}

RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

if (Meteor.isClient) {
    Session.set('infoUrl', undefined);
    Session.set('filterUrl', undefined);
    Meteor.call('getUrlInfo', "http://www.gold.ac.uk/computing/", function(error, result){
        console.log('error', error);
        console.log('result', result);
    });

    /////
    // template helpers
    /////

    // helper function that returns all available websites
    Template.website_list.helpers({
        websites: function () {
            if(Session.get('filterUrl')){
                return Websites.find(
                    {
                        url: {$regex : '^.*'+Session.get('filterUrl')+ '.*', $options : 'i'}
                    }
                );
            }
            else{
                return Websites.find({}, {sort : {upCount : -1}});
            }

        }
    });

    Template.website_form.helpers({
        infoUrl: function (){
            return Session.get('infoUrl');
        }
    });


    /////
    // template events
    /////

    Template.website_item.events({
        "click .js-upvote": function (event) {
            // example of how you can access the id for the website in the database
            // (this is the data context for the template)
            var website_id = this._id;
            var userId = Meteor.userId();

            //if there is a user logged in
            if (userId !== null) {
                //find if the user has vote
                var aux = Websites.findOne({
                    _id: website_id,
                    upVotes: {$ne: userId}
                });
                //if user hasn't vote I add the vote
                if (aux !== undefined) {
                    Websites.update(
                        website_id,
                        {
                            $inc: {upCount: 1},
                            $push: {upVotes: userId}
                        }
                    );
                }
                else {
                    alert('user has already vote!!!!');
                }
            }
            else{
                alert('you need to be logged in to vote');
            }


            //console.log("Up voting website with id "+website_id, Meteor.userId());
            // put the code in here to add a vote to a website!

            return false;// prevent the button from reloading the page
        },
        "click .js-downvote": function (event) {

            // example of how you can access the id for the website in the database
            // (this is the data context for the template)
            var website_id = this._id;
            var userId = Meteor.userId();
            //if there is a user logged in
            if (userId !== null) {
                //find if the user has vote
                var aux = Websites.findOne({
                    _id: website_id,
                    downVotes: {$ne: userId}
                });
                //if user hasn't vote I add the vote
                if(aux !== undefined){
                    Websites.update(
                        website_id,
                        {
                            $inc: {downCount: 1},
                            $push: {downVotes: userId}
                        }
                    );
                }
                else {
                    alert('user has not vote!!!!');
                }
            }
            else{
                alert('you need to be logged in to vote');
            }

            return false;// prevent the button from reloading the page
        }
    })

    Template.website_form.events({
        "click .js-toggle-website-form": function (event) {
            $("#website_form").toggle('slow');
        },
        "click .js-search-website": function (event) {
            Session.set('filterUrl', $('#search_filter').val());
            /*console.log('search', filter);
            var aux = Websites.find(
                {
                    url: {$regex : '^.*'+filter+ '.*', $options : 'i'}
                }
            );
            //Session.set('websites', aux);
            console.log('res', aux);*/
        },

        "submit .js-save-website-form": function (event) {

            // here is an example of how to get the url out of the form:
            var infoUrl = Session.get('infoUrl');

            if(!Websites.findOne({url: infoUrl.url})) {
                Websites.insert({
                    title: infoUrl.title,
                    url: infoUrl.url,
                    description: infoUrl.description,
                    createdOn: new Date()
                });
                Session.set('infoUrl',undefined);
                $("#website_form").toggle('slow');
                alert('url inserted');
            }
            else{
                alert('url already inserted');
            }





            //console.log("The url they entered is: ",Session.get('infoUrl'));

            //  put your website saving code in here!

            return false;// stop the form submit from reloading the page

        }, 

        "change #url, keyup #url": function(event){
            // here is an example of how to get the url out of the form:
            var url = event.currentTarget.value;
            $('#submit_web_form').prop( "disabled", true );
            if(validUrl(url)){
                Meteor.call('getUrlInfo', url, function(error, result){
                    if(!$.isEmptyObject(result)){
                        Session.set('infoUrl',result);
                        $('#submit_web_form').prop( "disabled", false );
                    }
                    else{
                        Session.set('infoUrl',undefined);
                    }
                });
            }
        }
    });
}


if (Meteor.isServer) {
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
}
