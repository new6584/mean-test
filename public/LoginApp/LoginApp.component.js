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
            "userName": '',
            "password": '',
            "displayName": '',
            "email": ''
        };
        this.http = http;
    }
    LogInComponent.prototype.submitLogin = function () {
        var headers = new http_1.Headers();
        this.http.post('/', { username: this.userInfo.userName, password: this.userInfo.password })
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            console.log(res);
            alert('logged in');
        });
    };
    LogInComponent.prototype.registerUser = function () {
        this.bcrypt.hash(this.userInfo.password, 10, function (err, hash) {
            this.http.post('/register', { username: this.userName, password: hash, displayName: this.displayName, email: this.email })
                .map(function (res) { return res.json(); })
                .subscribe(function (res) {
                console.log(res);
                alert('registered');
            });
        });
    };
    LogInComponent.prototype.forgotPassword = function () {
        console.log('forgot password');
    };
    LogInComponent.prototype.forgotEmail = function () {
        this.http.get('user' + this.userInfo.displayName)
            .map(function (res) { return res.json(); })
            .subscribe(function (res) {
            console.log(res);
            alert('email');
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