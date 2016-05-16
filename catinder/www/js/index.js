/*jslint browser this for bitwise */
/*global alert $ Tool tools toolFactory URL WebSocket FileReader Blob*/

(function () {
    "use strict";
    var app = {
        initialize: function () {
            this.bindEvents();
        },
        bindEvents: function () {
            document.addEventListener('deviceready', this.onDeviceReady, false);
            document.addEventListener('offline', this.offline, false);
            document.addEventListener('online', this.online, false);
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