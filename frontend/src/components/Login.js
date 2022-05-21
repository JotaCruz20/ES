import React, {Component} from "react";
import 'react-html5-camera-photo/build/css/index.css';
import {BrowserRouter as Router, Route, Switch, Redirect} from "react-router-dom";
import StaffPage from "./StaffPage";

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            login: false,
            token: null
        }
        this.login = this.login.bind(this);
    }

    async login() {
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('pass').value
            }),
        };
        const response = await fetch("/api/login", requestOptions);
        const data = await response.json();
        this.setState({
            login: true,
            token: data['token']
        });
    }

    render() {
        if (this.state.login === false) {
            return (
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username"/>
                    <label htmlFor="pass">Password:</label>
                    <input type="password" id="pass"/>
                    <button color="primary" onClick={this.login}>
                        Login
                    </button>
                </div>);
        } else {
            return (
                <Redirect to={{pathname:'/staff', state: { token: this.state.token }}}/>
            );
        }
    }
}