

import {Component} from '@angular/core';
import {Http, Headers} from '@angular/http';
@Component({
    selector:'register-app',
    template: ` <form (submit)='submitRegister()'>
                    <label for='login-user-name-entry'>User Name</label>
                    <input id='login-user-name-entry' type='text' name='userName' [(ngModel)]='userInfo.userName'>
                    <label for='login-password-entry'>Password</label>
                    <input id='login-password-entry' type='text' name='password' [(ngModel)]='userInfo.password'>
                    <p>display name</p>
                    <input id='login-password-entry' type='text' name='displayName' [(ngModel)]='userInfo.displayName'>
                    <p>email</p>
                    <input id='login-password-entry' type='text' name='email' [(ngModel)]='userInfo.email'>
                    <input type="submit" value="Register">
                </form> `
})
export class RegisterComponent{
    http;
    sjcl;
    KEY;
    userInfo ={
        "userName": null,
        "password": null,
        "displayName": '',
        "email":null
    };
    constructor(http: Http){
        this.http = http;
        this.sjcl = require('../../library/sjcl/sjcl.js');
        this.KEY = "my|5:7gZmb5XH688v2F4%eIn)5`DD9";
    }
    submitRegister(){
        console.log('clicked');
    }
    
}