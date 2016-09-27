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
var RegisterComponent = (function () {
    function RegisterComponent(http) {
        this.userInfo = {
            "userName": null,
            "password": null,
            "displayName": '',
            "email": null
        };
        this.http = http;
        this.sjcl = require('../../library/sjcl/sjcl.js');
        this.KEY = "my|5:7gZmb5XH688v2F4%eIn)5`DD9";
    }
    RegisterComponent.prototype.submitRegister = function () {
        console.log('clicked');
    };
    RegisterComponent = __decorate([
        core_1.Component({
            selector: 'register-app',
            template: " <form (submit)='submitRegister()'>\n                    <label for='login-user-name-entry'>User Name</label>\n                    <input id='login-user-name-entry' type='text' name='userName' [(ngModel)]='userInfo.userName'>\n                    <label for='login-password-entry'>Password</label>\n                    <input id='login-password-entry' type='text' name='password' [(ngModel)]='userInfo.password'>\n                    <p>display name</p>\n                    <input id='login-password-entry' type='text' name='displayName' [(ngModel)]='userInfo.displayName'>\n                    <p>email</p>\n                    <input id='login-password-entry' type='text' name='email' [(ngModel)]='userInfo.email'>\n                    <input type=\"submit\" value=\"Register\">\n                </form> "
        }), 
        __metadata('design:paramtypes', [http_1.Http])
    ], RegisterComponent);
    return RegisterComponent;
}());
exports.RegisterComponent = RegisterComponent;
//# sourceMappingURL=registerApp.component.js.map