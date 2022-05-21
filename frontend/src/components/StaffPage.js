import React, {Component} from "react";
import {Button, ButtonGroup} from "@material-ui/core";
import {Link} from "react-router-dom";

export default class StaffPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            token: this.props.location.state !== undefined ? this.props.location.state.token : null,
            pedidos: [],
            error: false
        }
    }

    async componentDidMount() {
        const response = await fetch(`/api/getPedidos/${this.state.token}`);
        const data = await response.json();
        if (response.status === 200) {
            this.setState({
                pedidos: data,
            });
        } else {
            this.setState({
                error: true,
            });
        }
    }

    render() {
        if (this.state.error === true || this.state.token===null) {
            return (
                <p>User não autenticado</p>
            );
        } else {
            return (
                <div className="app">
                    <div className="checkList">
                        <div className="title">Pedidos:</div>
                        <div className="list-container">
                            {this.state.pedidos.map((item, index) => (
                                <div key={index}>
                                    <span>{item["tag"] + ' ' + item["pedido"] + ' ' + item["StatusPedido"]}</span>
                                </div>
                            ))}
                        </div>
                        <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color="primary" to="/" component={Link}>
                            LogOut
                        </Button>
                    </ButtonGroup>
                    </div>
                </div>
            );
        }
    }
}