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
        "userName": '',
        "password": '',
        "displayName": '',
        "email":''
    };
    
    http;
    bcrypt;
    
    constructor(http: Http){
        this.http = http;
    }
    
    submitLogin(){      
        var headers = new Headers();
        this.http.post('/',{username: this.userInfo.userName, password: this.userInfo.password })
        .map(res => res.json())
            .subscribe(res => {
                console.log(res);
                alert('logged in');
            });
        // this.bcrypt.hash(this.userInfo.password, 10, function(err, hash){
        //     this.http.post('/login', {username: this.userName, password: hash})
        //     .map(res => res.json())
        //     .subscribe(res => {
        //         console.log(res);
        //         alert('logged in');
        //     }) 
        // });  
    }

    registerUser(){
        this.bcrypt.hash(this.userInfo.password, 10, function(err, hash){
            this.http.post('/register', {username: this.userName, password: hash, displayName: this.displayName, email: this.email})
            .map( res => res.json())
            .subscribe(res => {
                console.log(res);
                alert('registered');
            })
        });
    }

    forgotPassword(){//TODO: not implemented backend?
        
        console.log('forgot password');
    }

    forgotEmail(){//TODO: not implemented backend?
        this.http.get('user' + this.userInfo.displayName)
        .map(res => res.json())
        .subscribe(res => {
            console.log(res);
            alert('email'); //send email to them (server side?)
        })
    }
}
