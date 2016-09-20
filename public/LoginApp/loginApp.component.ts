/*
    @author: Nick Womble
    @Razou 
    
    requires:
        FormsModule
        
        form creates field handle in api call
        from model 
        forget .use stuff
*/

import {Component} from '@angular/core';
import {Http, Headers} from '@angular/http';
//import {hash} from 'bcrypt';
//import * as bycrpt from 'bcrypt';

@Component({
    selector:'login-app',
    template: ` <form (submit)='submitLogin()'>
                    <label for='login-user-name-entry'>User Name</label>
                    <input id='login-user-name-entry' type='text' name='userName' [(ngModel)]='userInfo.userName'>
                    <label for='login-password-entry'>Password</label>
                    <input id='login-password-entry' type='text' name='password' [(ngModel)]='userInfo.password'>
                    <p>display name</p>
                    <input id='login-password-entry' type='text' name='displayName' [(ngModel)]='userInfo.displayName'>
                    <p>email</p>
                    <input id='login-password-entry' type='text' name='email' [(ngModel)]='userInfo.email'>
                    <input type="submit" value="Log in">
                    <span class='login-extras'>
                        <span class= 'login-click-able login-register' (click)="registerUser()">Register!</span>
                        <span class= 'login-click-able login-forgotPassword' (click)="forgotPassword()">Forgot Password?</span>
                        <span class= 'login-click-able login-forgotEmail' (click)="forgotEmail()">Forgot Email?</span> 
                    </span>
                </form> `
})
export class LogInComponent{
    
    userInfo ={
        "userName": null,
        "password": null,
        "displayName": '',
        "email":null
    };
    
    http;
    encriptLib;
    
    constructor(http: Http){
        this.http = http;
        //load in encryption library 
        this.encriptLib = require('../../library/sjcl/sjcl.js');
    }
    
    submitLogin(){      
        if(this.userInfo.password.length <= 0){
            console.log('no password entered');
            return;
        }
        //encrypt password (our-password, their-password)
        var safePass = this.encriptLib.encrypt("TEMP-KEY",this.userInfo.password);
        // DECRYPT this.encriptLib.decrypt(this.userInfo.userName,safePass);
        
        var sendObj ={username: this.userInfo.userName, password: safePass, email: this.userInfo.email};
        this.http.post('/login',sendObj)
        .map(res => res.json())
            .subscribe(res => {
                console.log(res);
                alert('logged in');
            });
    }

    registerUser(){
        var pw =  this.encriptLib.encrypt("TEMP-KEY",this.userInfo.password);
        var messageObj = {username: this.userInfo.userName, 
                            password:  pw,
                            displayName: this.userInfo.displayName,
                            email: this.userInfo.email}
        this.http.post('/register', messageObj)
        .map(res => res.json())
            .subscribe(res => {
                console.log(res);
                alert('logged in');
            });
    }

    forgotPassword(){//TODO: not implemented backend?
        
        console.log('forgot password');
    }

    forgotEmail(){//TODO: not implemented backend?
        this.http.post('/',{username: this.userInfo.userName, password: this.userInfo.password })
        .map(res => res.json())
            .subscribe(res => {
                console.log(res);
                alert('logged in');
            });
    }
}
