/*jslint browser this for bitwise */
/*global alert $ Tool tools toolFactory URL WebSocket FileReader Blob*/

(function () {
    "use strict";
    var app = {
        catsPool: [],
        catsLoved: [],
        catsHated: [],
        initialize: function () {
            this.bindEvents();
        },
        bindEvents: function () {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            document.addEventListener('offline', this.offline, false);
            document.addEventListener('online', this.online, false);
        getCats: function () {
            var self = this;
            var url = "http://catinder.samsung-campus.net/proxy.php";

            if (this.geoloc.enabled) {
                url = url + "?position=" + this.geoloc.coordinates.lat + "," + this.geoloc.coordinates.long;
            }
            $.ajax({
                url: url
            }).done(function (data) {
                var cats = JSON.parse(data).results;
                self.proceedCats(cats);
            });
        },
        proceedCats: function (cats) {
            var self = this;
            cats.forEach(function (cat) {
                if (self.isCatIn(cat, self.catsHated) === false && self.isCatIn(cat, self.catsLoved) === false) {
                    self.catsPool.push(cat);
                }
            });
            this.prepareOneCat();
        },
            }
        },
        onDeviceReady: function () {
            this.receivedEvent('deviceready');
        },
        offline: function () {
            alert('On est Offline !');
        },
        online: function () {
            alert('On est Online !');
        },
        receivedEvent: function (id) {
            alert("Le device est pret");
        }
    };
    app.initialize();
}());