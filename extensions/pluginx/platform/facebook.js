(function(P){


    var name = "facebook";

    var userInfo = {
        //accessToken: "",
        //expriesIn: "",
        //signedRequest: "",
        //userID: ""
    };

    var errMsg = {
        '0': 'success',
        '1': 'Unknown error',
        '2': 'Network error',
        '3': 'Without permission',
        '4': 'Interrupt operation'
    };

    var configCache = {};
    var isInit = false;

    P.extend(name, {
        init: function(config){
            if (!FB || isInit) {
                return;
            }
            var self = this;
            self._isLogined = false;
            configCache = config;
            FB.init({
                appId : config['appId'],
                xfbml : config['xfbml'],
                version : config['version']
            });
            FB.getLoginStatus(function(response) {
                if (response && response.status === 'connected') {
                    //login
                    self._isLogined = true;
                    //save user info
                    userInfo = response.authResponse;
                }else{
                    self._isLogined = false;
                }
            });
            isInit = true;
        },

        /*
            User Class
         */
        user: {

            login: function(callback){
                var self = this;
                FB.login(function(response) {
                    if (response.authResponse) {
                        self._isLogined = true;
                        //save user info
                        userInfo = response.authResponse;
                        typeof callback === 'function' && callback(0, errMsg[0]);
                    } else {
                        typeof callback === 'function' && callback(1, errMsg[1]);
                    }
                }, { scope: '' });
            },

            logout: function(callback){
                FB.logout(function(response) {
                    if(response.authResponse){
                        // user is now logged out
                        self._isLogined = false;
                        userInfo = {};
                        typeof callback === 'function' && callback(0, errMsg[0]);
                    }else{
                        typeof callback === 'function' && callback(1, errMsg[1]);
                    }
                });
            },

            isLogined: function(callback){
                var self = this;

                FB.getLoginStatus(function(response) {
                    if (response && response.status === 'connected') {
                        self._isLogined = true;
                        //login - save user info
                        userInfo = response.authResponse;
                        typeof callback === 'function' && callback(0);
                    }else{
                        self._isLogined = false;
                        typeof callback === 'function' && callback(1, errMsg[1]);
                    }
                });
                return this._isLogined;
            },

            getUserId: function(){
                return userInfo['userID'];
            },

            getToken: function(){
                return userInfo['accessToken'];
            }
        },

        /*
            Share Class
         */
        share:{
            /*

            info: {
                site:
                title:
                caption:
                link:
                text:
                imagePath:
                imageUrl:
                location:

                dialogMode:

                notifyText:
                notifyIcon:

                comment:
            }

             */
            share: function(info, callback){

                FB.ui({
                    method: 'share',
                    name: info['title'],
                    caption: info['caption'],
                    description: info['text'],
                    href: info['link'],
                    picture: info['imageUrl']
                },
                function(response) {
                    if (response) {
                        if(response.post_id)
                            typeof callback === 'function' && callback(0, errMsg[0]);
                        else
                            typeof callback === 'function' && callback(3, errMsg[3]);
                    } else {
                        typeof callback === 'function' && callback(4, errMsg[4]);
                    }
                });
            }
        },

        /*
            Social Class
         */
        social: {
            submitScore: function(callback){
                if(userInfo.userID){
                    FB.api("/"+userInfo.userID+"/scores", 'post', {score: 100}, function(response){
                        console.log(response);
                        if(response){
                            typeof callback === 'function' && callback(0, errMsg[0]);
                        }else{
                            typeof callback === 'function' && callback(1, errMsg[1]);
                        }
                    });
                }else{
                    callback(3, errMsg[3]);
                }
            },
            showLeaderboard: function(callback){
                if(configCache['appId']){
                    FB.api("/"+configCache['appId']+"/scores", function(response){
                        if(response['error']){
                            typeof callback === 'function' && callback(1, response['message']);
                        }else if(response['data']){
                            typeof callback === 'function' && callback(0, response['data']);
                        }
                    });
                }
            },
            unlockAchievement: function(){

            },
            showAchievements: function(){

            }
        },

        dialog: function(options, callback){

            FB.ui({
                    method: 'share',
                    name: options['title'],
                    caption: options['caption'],
                    description: options['text'],
                    href: options['link'],
                    picture: options['imageUrl']
                },
                function(response) {
                    if (response) {
                        if(response.post_id)
                            typeof callback === 'function' && callback(0, errMsg[0]);
                        else
                            typeof callback === 'function' && callback(3, errMsg[3]);
                    } else {
                        typeof callback === 'function' && callback(4, errMsg[4]);
                    }
                });
        },

        ui: FB.ui,
        api: FB.api
    });


})(plugin);