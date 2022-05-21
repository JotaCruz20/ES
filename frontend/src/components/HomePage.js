import React, {Component} from "react";
import {Grid, Button, ButtonGroup, Typography} from "@material-ui/core";
import FazerPedido from './FazerPedido';
import Login from './Login';
import StaffPage from './StaffPage';
import 'react-html5-camera-photo/build/css/index.css';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";

export default class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    renderHomePage() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} align="center">
                    <Typography variant="h3" compact="h3">
                        Bem Vindo!
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color="primary" to="/pedido" component={Link}>
                            Fazer Pedido
                        </Button>
                        <Button color="secondary" to="/login" component={Link}>
                            Staff
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route
                        exact path="/"
                        render={() => {
                            return this.renderHomePage();
                        }}
                    />
                    <Route path="/pedido" component={FazerPedido}/>
                    <Route path="/login" component={Login}/>
                    <Route path="/staff" component={StaffPage}/>
                </Switch>
            </Router>
        );
    }
}