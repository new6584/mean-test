"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var http_1 = require('@angular/http');
var LogInComponent = (function () {
    function LogInComponent(http) {
        this.userInfo = {
            "userName": null,
            "password": null,
            "displayName": '',
            "email": null
        };
        this.http = http;
        this.encriptLib = require('../../library/sjcl/sjcl.js');
    }
    LogInComponent.prototype.submitLogin = function () {
        if (this.userInfo.password.length <= 0) {
            console.log('no password entered');
            return;
        }
        var safePass = this.encriptLib.encrypt("TEMP-KEY", this.userInfo.password);
        var sendObj = { username: this.userInfo.userName, password: safePass, email: this.userInfo.email };
        this.http.post('/login', sendObj)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            console.log(res);
            alert('logged in');
        });
    };
    LogInComponent.prototype.registerUser = function () {
        var pw = this.encriptLib.encrypt("TEMP-KEY", this.userInfo.password);
        var messageObj = { username: this.userInfo.userName,
            password: pw,
            displayName: this.userInfo.displayName,
            email: this.userInfo.email };
        this.http.post('/register', messageObj)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            console.log(res);
            alert('logged in');
        });
    };
    LogInComponent.prototype.forgotPassword = function () {
        console.log('forgot password');
    };
    LogInComponent.prototype.forgotEmail = function () {
        this.http.post('/', { username: this.userInfo.userName, password: this.userInfo.password })
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            console.log(res);
            alert('logged in');
        });
    };
    LogInComponent = __decorate([
        core_1.Component({
            selector: 'login-app',
            template: " <form (submit)='submitLogin()'>\n                    <label for='login-user-name-entry'>User Name</label>\n                    <input id='login-user-name-entry' type='text' name='userName' [(ngModel)]='userInfo.userName'>\n                    <label for='login-password-entry'>Password</label>\n                    <input id='login-password-entry' type='text' name='password' [(ngModel)]='userInfo.password'>\n                    <p>display name</p>\n                    <input id='login-password-entry' type='text' name='displayName' [(ngModel)]='userInfo.displayName'>\n                    <p>email</p>\n                    <input id='login-password-entry' type='text' name='email' [(ngModel)]='userInfo.email'>\n                    <input type=\"submit\" value=\"Log in\">\n                    <span class='login-extras'>\n                        <span class= 'login-click-able login-register' (click)=\"registerUser()\">Register!</span>\n                        <span class= 'login-click-able login-forgotPassword' (click)=\"forgotPassword()\">Forgot Password?</span>\n                        <span class= 'login-click-able login-forgotEmail' (click)=\"forgotEmail()\">Forgot Email?</span> \n                    </span>\n                </form> "
        }), 
        __metadata('design:paramtypes', [http_1.Http])
    ], LogInComponent);
    return LogInComponent;
}());
exports.LogInComponent = LogInComponent;
//# sourceMappingURL=LoginApp.component.js.map