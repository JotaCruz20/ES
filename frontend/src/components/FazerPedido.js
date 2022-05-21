import React, {Component} from "react";
import Camera from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import {TailSpin} from 'react-loader-spinner';

export default class FazerPedido extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pratos: [],
            escolhidos: [],
            enabled: [],
            loading: true,
            completed: false,
            token: null,
            input: null,
            price: null,
            userError: false
        };
        this.handleTakePhoto = this.handleTakePhoto.bind(this);
        this.handleCheck = this.handleCheck.bind(this);
        this.checkedItems = this.checkedItems.bind(this);
        this.handleUncheck = this.handleUncheck.bind(this);
        this.getPrice = this.getPrice.bind(this);
        this.confirmRequest = this.confirmRequest.bind(this);
        this.backButton = this.backButton.bind(this);
    }

    async componentDidMount() {
        const response = await fetch("/api/items");
        const data = await response.json();
        this.setState({
            pratos: data,
            enabled: Array(data.length).fill('false'),
            loading: false
        });
    }

    handleCheck(event) {
        var updatedList = [...this.state.escolhidos, event.target.value];
        var updatedEnables = this.state.enabled;
        updatedEnables[event.target.value] = 'true';
        this.setState({
            escolhidos: updatedList,
            enabled: updatedEnables
        });
    }

    handleUncheck(event) {
        var updatedList = [...this.state.escolhidos];
        updatedList.splice(this.state.escolhidos.indexOf(event.target.value), 1);
        var updatedEnables = this.state.enabled;
        if (updatedList.includes(event.target.value) === false) {
            updatedEnables[event.target.value] = 'false';
        }
        this.setState({
            escolhidos: updatedList,
            enabled: updatedEnables
        });
    }

    checkedItems() {
        if (this.state.escolhidos.length >= 1) {
            let s = "";
            this.state.escolhidos.map((item, index) => {
                s = s.concat(this.state.pratos[item]["Name"]).concat(',');
            })
            return s;
        } else {
            return "";
        }
    }

    async handleTakePhoto(dataUri) {
        const pedidos = [];
        this.setState({
            loading: true,
        })
        this.state.escolhidos.map((item, index) => {
            pedidos.push(this.state.pratos[item]);
        })
        let tag = document.getElementById('tag');
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                image: dataUri,
                pedido: pedidos,
                tag: tag.value
            }),
        };
        const response = await fetch("/api/addPhoto", requestOptions);
        const data = await response.json();
        if (data['Bad Request'] != null) {
            this.setState({
                userError: true
            })
        } else {
            this.setState({
                completed: true,
                loading: false,
                token: data['token'],
                input: data['input']
            })
        }
        //
    }

    async getPrice() {
        const pedidos = [];
        this.state.escolhidos.map((item, index) => {
            pedidos.push(this.state.pratos[item]);
        })
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                pedidos: pedidos
            }),
        };
        const response = await fetch("/api/getPrice", requestOptions);
        const data = await response.json();
        this.setState({
                price:data['Price']
            })
        var div = document.getElementById('Photo');
        if (div.style.display !== 'none') {
            div.style.display = 'block';
        } else {
            div.style.display = 'none';
        }
    }

    confirmRequest() {
        const requestOptions2 = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                token: this.state.token,
                input: this.state.input
            }),
        };
        fetch("/api/finishRequest", requestOptions2).then((response2) => response2);
        location.href = '/'
    }

    backButton() {
        location.href = '/'
    }

    render() {
        if (this.state.userError === true) {
            return (
                <div>
                    <p>Utilizador não encontrado. Diriga-se à assistencia técnica.</p>
                    <button onClick={this.backButton}>
                        Voltar Atrás.
                    </button>
                </div>
            )
        }
        if (this.state.loading === true) {
            return (
                <div>
                    <p>A Preparar o Seu Pedido!</p>
                    <TailSpin color="#00BFFF" height={80} width={80}/>
                </div>
            )
        } else {
            if (this.state.completed === false) {
                return (
                    <div className="app">
                        <div className="checkList">
                            <div className="title">Pratos:</div>
                            <div className="list-container">
                                {this.state.pratos.map((item, index) => (
                                    <div key={index}>
                                        <button color="primary" value={index} onClick={this.handleCheck}>
                                            Add
                                        </button>
                                        <button color="secondary" disabled={this.state.enabled[index] === 'false'}
                                                value={index} onClick={this.handleUncheck}>
                                            Remove
                                        </button>
                                        <span>{item["Name"] + '-' + item["Price"] + '€'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            {`Items checked are: ${this.checkedItems()}`}
                        </div>
                        <div>
                            <button onClick={this.getPrice}
                                    disabled={this.state.escolhidos.length === 0 || document.getElementById('tag').value === '' | document.getElementById('tag').value === null}>
                                Fazer Pedido
                            </button>
                        </div>
                        <br/>
                        <div>
                            <label htmlFor="tentacles">Número da Tag:</label>
                            <input type="number" min="1" id="tag" max="999"/>
                        </div>
                        <br/>
                        <div id="Photo" hidden="true">
                            {`Preço: ${this.state.price}`}
                            <br/>
                            <Camera onTakePhoto={(dataUri) => {
                                this.handleTakePhoto(dataUri);
                            }}/>
                        </div>
                    </div>);
            } else {
                return (
                    <div>
                        <button onClick={this.confirmRequest}>
                            Confirmar Pedido!
                        </button>
                    </div>
                )
            }
        }
    }

}