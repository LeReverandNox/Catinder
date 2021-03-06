/*jslint browser this for */
/*global alert $ */

(function () {
    "use strict";
    var app = {
        catsPool: [],
        catsLoved: [],
        catsHated: [],
        catinderProfil: null,
        catinderPictureHolder: null,
        catinderInfosName: null,
        catinderInfosAge: null,
        catinderFavorisList: null,
        loading: true,
        currentCat: null,
        geoloc: {
            enabled: false,
            coords: {}
        },
        sidebar: null,
        mainSection: null,
        favorisSection: null,
        isOnline: true,
        isSidebarOpen: false,
        loader: null,
        likeButton: null,
        dislikeButton: null,
        resetButton: null,
        body: null,
        catinderProfilDivs: null,
        konamiCode: ["U", "U", "D", "D", "L", "R", "L", "R", "B", "A"],
        onGoingCode: [],
        isKonamiEnable: false,
        nyanCatMusic: new Audio("sound/nyan-cat.mp3"),
        initialize: function () {
            this.populateAttributes();
            this.loadFromStorage();
            this.enableGeoloc();
            this.bindEvents();
            this.switchLoader();
        },
        populateAttributes: function () {
            this.catinderPictureHolder = document.querySelector(".catinder-picture-holder");
            this.catinderInfosName = document.querySelector(".catinder-infos-name");
            this.catinderInfosAge = document.querySelector(".catinder-infos-age");
            this.catinderFavorisList = document.querySelector(".catinder-favoris-list");
            this.sidebar = $('.sidebar-holder');
            this.mainSection = $('.catinder-home');
            this.favorisSection = $('.catinder-favoris');
            this.catinderProfil = $('.catinder-profil');
            this.loader = $('.loader');
            this.likeButton = $('.catinder-like');
            this.dislikeButton = $('.catinder-dislike');
            this.resetButton = $('.catinder-clear-lists');
            this.body = document.querySelector('body');
            this.catinderProfilDivs = this.catinderProfil.find('div');
        },
        bindEvents: function () {
            document.querySelector(".catinder-like").addEventListener("touchstart", this.growLikeButton.bind(this));
            document.querySelector(".catinder-like").addEventListener("touchend", this.disgrowLikeButton.bind(this));
            document.querySelector(".catinder-dislike").addEventListener("touchstart", this.growDislikeButton.bind(this));
            document.querySelector(".catinder-dislike").addEventListener("touchend", this.disgrowDislikeButton.bind(this));
            document.querySelector(".catinder-clear-lists").addEventListener("touchstart", this.growResetButton.bind(this));
            document.querySelector(".catinder-clear-lists").addEventListener("touchend", this.disgrowResetButton.bind(this));
            document.querySelector(".burger-button").addEventListener("touchstart", this.showSidebar.bind(this));
            document.querySelector(".sidebar-list").addEventListener("touchstart", this.handleSidebar.bind(this));
            document.querySelector(".title").addEventListener("touchstart", this.disableKonami.bind(this));
            document.addEventListener("offline", this.changeConnectionStatus.bind(this));
            document.addEventListener("online", this.changeConnectionStatus.bind(this));
            document.addEventListener("touchstart", this.hideSidebar.bind(this));
            document.addEventListener('deviceready', this.whenIsReady.bind(this));

            this.startCatSwipe();
            this.startCatDoubleTap();
        },
        getCats: function () {
            var self = this;
            var url = "http://catinder.samsung-campus.net/proxy.php";

            if (this.geoloc.enabled) {
                url = url + "?position=" + this.geoloc.coordinates.lat + "," + this.geoloc.coordinates.long;
            }
            if (this.isOnline) {
                $.ajax({
                    url: url
                }).done(function (data) {
                    var cats = JSON.parse(data).results;
                    self.proceedCats(cats);
                });
            } else {
                this.displayNetworkError();
                this.loading = false;
            }
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
        isCatIn: function (cat, array) {
            var i;
            for (i = 0; i < array.length; i += 1) {
                if (array[i].sha1 === cat.sha1) {
                    return true;
                }
            }
            return false;
        },
        prepareOneCat: function () {
            if (this.checkRemainingCats() === true) {
                this.currentCat = this.catsPool[0];
                this.catsPool.splice(0, 1);
                this.displayOneCat(this.currentCat);
            }
        },
        displayOneCat: function (cat) {
            var self = this;
            var img = new Image();
            img.src = cat.picUrl;
            img.onload = function () {
                if (self.catinderPictureHolder.children[0]) {
                    self.catinderPictureHolder.removeChild(self.catinderPictureHolder.firstChild);
                }
                img.className = "catinder-picture-img";
                self.catinderPictureHolder.appendChild(img);
                self.catinderInfosName.innerHTML = cat.name;
                self.catinderInfosAge.innerHTML = cat.age + " ans";
                self.catinderProfil.removeClass("grow fadeout rotate-left rotate-right");
                self.catinderProfilDivs.removeClass("fade-green fade-red");
                self.loading = false;
                self.switchLoader();
            };
        },
        checkRemainingCats: function () {
            if (this.catsPool.length === 0) {
                this.getCats();
                return false;
            }
            return true;
        },
        likeCat: function () {
            var self = this;
            if (this.loading === false && this.isSidebarOpen === false) {
                if (this.currentCat !== null) {
                    this.loading = true;
                    this.switchLoader();
                    this.catsLoved.push(this.currentCat);
                    this.currentCat = null;
                    this.saveToStorage();
                    this.catinderProfil.addClass("grow");
                    this.catinderProfilDivs.addClass('fade-green');
                    this.catinderProfil.one("transitionend", function () {
                        self.prepareOneCat();
                    });
                } else {
                    this.displayNetworkError();
                }
            }
        },
        dislikeCat: function (source) {
            var self = this;
            if (this.loading === false && this.isSidebarOpen === false) {
                if (this.currentCat !== null) {
                    this.loading = true;
                    this.switchLoader();
                    this.catsHated.push(this.currentCat);
                    this.currentCat = null;
                    this.saveToStorage();

                    switch (source) {
                    case "button":
                        this.catinderProfil.addClass("fadeout");
                        break;
                    case "swipe-left":
                        this.catinderProfil.addClass("rotate-left");
                        break;
                    case "swipe-right":
                        this.catinderProfil.addClass("rotate-right");
                        break;
                    }

                    this.catinderProfilDivs.addClass('fade-red');
                    this.catinderProfil.one("transitionend", function () {
                        self.prepareOneCat();
                    });
                } else {
                    this.displayNetworkError();
                }
            }
        },
        growLikeButton: function () {
            this.likeButton.removeClass('button-disgrow');
            this.likeButton.addClass('button-grow');

            if (this.likeButton.hasClass("konami-a")) {
                this.onGoingCode.push("A");
                this.verifKonami();
            } else {
                this.likeCat();
            }
        },
        growDislikeButton: function () {
            this.dislikeButton.removeClass('button-disgrow');
            this.dislikeButton.addClass('button-grow');

            if (this.dislikeButton.hasClass("konami-b")) {
                this.onGoingCode.push("B");
                this.verifKonami();
            } else {
                this.dislikeCat("button");
            }
        },
        disgrowLikeButton: function () {
            this.likeButton.removeClass('button-grow');
            this.likeButton.addClass('button-disgrow');
        },
        disgrowDislikeButton: function () {
            this.dislikeButton.removeClass('button-grow');
            this.dislikeButton.addClass('button-disgrow');
        },
        growResetButton: function () {
            this.resetButton.removeClass('button-disgrow');
            this.resetButton.addClass('button-grow');
            this.clearLists();
        },
        disgrowResetButton: function () {
            this.resetButton.removeClass('button-grow');
            this.resetButton.addClass('button-disgrow');
        },
        enableGeoloc: function () {
            var self = this;
            navigator.geolocation.getCurrentPosition(function (data) {
                self.geoloc.enabled = true;
                self.geoloc.coordinates = {
                    lat: data.coords.latitude,
                    long: data.coords.longitude
                };
            });
        },
        startCatDoubleTap: function () {
            var self = this;
            var delays = [];
            var duration = 300;
            var minDuration = 100;
            this.catinderPictureHolder.addEventListener("touchstart", function (event) {
                delays.push(event.timeStamp);
                if (delays.length === 2) {
                    if (delays[1] - delays[0] <= duration && delays[1] - delays[0] >= minDuration) {
                        self.likeCat();
                    }
                    delays.splice(0, 1);
                }
            });
        },
        startCatSwipe: function () {
            var movesX = [];
            var movesY = [];
            var delays = [];
            var treshold = 75;
            var duration = 1000;
            var self = this;
            var startElement = null;

            var movesPush = function (e) {
                movesX.push(e.touches[0].clientX);
                movesY.push(e.touches[0].clientY);
            };

            this.body.addEventListener("touchstart", function (e) {
                movesX = [];
                delays = [];
                startElement = e.target;
                delays.push(e.timeStamp);

                self.body.addEventListener("touchmove", movesPush);
            });

            this.body.addEventListener("touchend", function (e) {
                self.body.removeEventListener("touchmove", movesPush);
                delays.push(e.timeStamp);
                if (self.isSidebarOpen === false) {
                    if (delays[1] - delays[0] <= duration) {
                        if (movesX[movesX.length - 1] - movesX[0] >= treshold || movesX[0] - movesX[movesX.length - 1] >= treshold) {
                            if (movesX[0] <= 80) {
                                // Swipe de sidebar
                                self.showSidebar();
                            } else if (startElement.tagName === 'LI' && startElement.getAttribute('data-sha1')) {
                                // Swipe pour delete un favori depuis sa li
                                if (movesX[movesX.length - 1] - movesX[0] >= treshold) {
                                    self.removeCatFromLoved(startElement.getAttribute('data-sha1'), startElement, "right");
                                } else {
                                    self.removeCatFromLoved(startElement.getAttribute('data-sha1'), startElement, "left");
                                }
                            } else if ($(startElement).parents()[0].getAttribute('data-sha1')) {
                                // Swipe pour delete un favori depuis le parent de l'element
                                var parent = $(startElement).parents()[0];
                                if (movesX[movesX.length - 1] - movesX[0] >= treshold) {
                                    self.removeCatFromLoved(parent.getAttribute('data-sha1'), parent, "right");
                                } else {
                                    self.removeCatFromLoved(parent.getAttribute('data-sha1'), parent, "left");
                                }
                            } else {
                                // Swipe pour dislike
                                if (movesX[movesX.length - 1] - movesX[0] >= treshold) {
                                    self.dislikeCat("swipe-right");
                                } else {
                                    self.dislikeCat("swipe-left");
                                }
                            }
                        }
                        if (movesX[movesX.length - 1] - movesX[0] >= treshold) {
                            self.onGoingCode.push("R");
                            self.verifKonami();
                        } else if (movesX[0] - movesX[movesX.length - 1] >= treshold) {
                            self.onGoingCode.push("L");
                            self.verifKonami();
                        } else if (movesY[movesY.length - 1] - movesY[0] >= treshold) {
                            self.onGoingCode.push("D");
                            self.verifKonami();
                        } else if (movesY[0] - movesY[movesY.length - 1] >= treshold) {
                            self.onGoingCode.push("U");
                            self.verifKonami();
                        }
                    }
                }
                movesX = [];
                movesY = [];
            });
        },
        loadFromStorage: function () {
            if (localStorage.getItem("catinder-loved") !== null) {
                this.catsLoved = JSON.parse(localStorage.getItem("catinder-loved"));
            }
            if (localStorage.getItem("catinder-hated") !== null) {
                this.catsHated = JSON.parse(localStorage.getItem("catinder-hated"));
            }
        },
        saveToStorage: function () {
            localStorage.setItem("catinder-loved", JSON.stringify(this.catsLoved));
            localStorage.setItem("catinder-hated", JSON.stringify(this.catsHated));
        },
        clearLists: function () {
            this.clearHated();
            this.clearLoved();
        },
        clearLoved: function () {
            this.catsLoved = [];
            this.updateFavorisList();
            this.saveToStorage();
        },
        clearHated: function () {
            this.catsHated = [];
            this.saveToStorage();
        },
        updateFavorisList: function () {
            var self = this;
            this.catinderFavorisList.innerHTML = "";
            this.catsLoved.forEach(function (cat) {
                var li = document.createElement("li");
                li.className = "catinder-favoris-li";
                li.setAttribute("data-sha1", cat.sha1);
                var img = new Image();
                img.src = cat.picUrl;
                img.onload = function () {
                    li.appendChild(img);
                    var p = document.createElement("p");
                    p.innerHTML = cat.name;
                    li.appendChild(p);
                    self.catinderFavorisList.appendChild(li);
                };
            });
        },
        showSidebar: function () {
            var self = this;
            this.sidebar.removeClass("hide-sidebar");
            this.sidebar.addClass("show-sidebar");
            this.sidebar.one("transitionend", function () {
                self.isSidebarOpen = true;
            });
        },
        hideSidebar: function () {
            var self = this;
            if (this.isSidebarOpen) {
                this.sidebar.removeClass("show-sidebar");
                this.sidebar.addClass("hide-sidebar");
                this.sidebar.one("transitionend", function () {
                    self.isSidebarOpen = false;
                });
            }
        },
        handleSidebar: function (event) {
            switch (event.target.dataset.menuSection) {
            case "home":
                this.showSection("home");
                this.hideSidebar();
                break;
            case "favoris":
                this.showSection("favoris");
                this.hideSidebar();
                break;
            }
        },
        showSection: function (section) {
            switch (section) {
            case 'home':
                this.mainSection.show();
                this.favorisSection.hide();
                break;
            case 'favoris':
                this.updateFavorisList();
                this.favorisSection.show();
                this.mainSection.hide();
                break;
            }
        },
        changeConnectionStatus: function (event) {
            switch (event.type) {
            case "offline":
                this.isOnline = false;
                this.displayNetworkError();
                break;
            case "online":
                this.isOnline = true;
                this.getCats();
                break;
            }
        },
        displayNetworkError: function () {
            alert('Votre appareil est hors-ligne, veuillez vérifier votre connexion');
        },
        switchLoader: function () {
            if (this.loading) {
                this.loader.show();
            } else {
                this.loader.hide();
            }
        },
        removeCatFromLoved: function (sha1, li, direction) {
            var catToRemove = this.catsLoved.filter(function (cat) {
                return cat.sha1 === sha1;
            });
            var index = this.catsLoved.indexOf(catToRemove[0]);
            this.catsLoved.splice(index, 1);
            if (direction === "left") {
                $(li).addClass("ease-left");
            } else {
                $(li).addClass("ease-right");
            }
            $(li).one("transitionend", function () {
                $(li).remove();
            });
        },
        whenIsReady: function () {
            navigator.splashscreen.hide();
        },
        verifKonami: function () {
            if (this.konamiCode[this.onGoingCode.length - 1] === undefined || this.onGoingCode[this.onGoingCode.length - 1] !== this.konamiCode[this.onGoingCode.length - 1]) {
                this.onGoingCode = [];
                this.likeButton.removeClass("konami-a");
                this.dislikeButton.removeClass("konami-b");
            }

            if (this.onGoingCode.length === 8) {
                this.likeButton.addClass("konami-a");
                this.dislikeButton.addClass("konami-b");
            }

            if (this.onGoingCode.length === 10) {
                this.likeButton.removeClass("konami-a");
                this.dislikeButton.removeClass("konami-b");
                this.disenableKonami();
            }
        },
        disableKonami: function () {
            this.isKonamiEnable = false;

            this.nyanCatMusic.pause();
            this.nyanCatMusic.currentTime = 0;
            document.querySelector(".title").innerHTML = "Cat'inder";
            $(".nyan-cat").remove();
            this.displayOneCat(this.currentCat);
        },
        enableKonami: function () {
            var self = this;
            this.isKonamiEnable = true;

            // Let the fun BEGINS !
            this.nyanCatMusic.play();
            document.querySelector(".title").innerHTML = "Catin'der";
            $(".catinder-picture-img").attr("src", "img/nyan-cat-pic.jpg").load(function () {
                self.catinderInfosName.innerHTML = "Nyan Cat";
                self.catinderInfosAge.innerHTML = "42 ans";
            });
            var i;
            for (i = 0; i < 10; i += 1) {
                this.spawnNyanCat();
            }
        },
        disenableKonami: function () {
            if (this.isKonamiEnable) {
                this.disableKonami();
            } else {
                this.enableKonami();
            }
        },
        spawnNyanCat: function () {
            var self = this;
            var nc = new Image();
            nc = $(nc);
            nc.attr('src', 'img/nyan-cat.gif').load(function () {
                nc.addClass("nyan-cat");
                nc.appendTo(self.mainSection);
                self.animateNyanCat(nc);
            });
        },
        animateNyanCat: function (nc) {
            var self = this;
            if (this.isKonamiEnable) {
                var speed = Math.random() * (7500 - 2500) + 2500;
                var y = Math.random() * (580 - (-100)) + (-100);
                var width = Math.random() * (750 - 250) + 250;

                nc.css({
                    left: "-500px",
                    top: y,
                    width: width
                });
                nc.animate({
                    left: "500px"
                }, speed, function () {
                    self.animateNyanCat(nc);
                });
            }
        }
    };
    app.initialize();
}());