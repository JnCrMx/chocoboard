import React from 'react';
import axios from 'axios';

import { MyContext } from './context.js';
import Config from './config.js';
import { RoleSelector } from './Selectors.jsx'
import { replaceEmojis } from './emoji.jsx'

class ShopItemEditor extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            item: props.data,
            selectingRole: false,
            dirty: false
        };
    }

    static getDerivedStateFromProps(props, state)
    {
        if(!state.dirty)
        {
            return {
                item: props.data
            }
        }
        else
        {
            return {};
        }
    }

    selectingRole = event =>
    {
        this.setState({
            selectingRole: true
        });
    }

    selectRole = role =>
    {
        var copy = {...this.state.item};
        copy.role = role;

        this.setState({
            item: copy,
            selectingRole: false,
            dirty: true
        });
    }

    updateField = event =>
    {
        var copy = {...this.state.item};
        copy[event.target.name] = event.target.value;

        this.setState({
            item: copy,
            dirty: true
        });
    }

    save = () =>
    {
        this.props.callback(this.state.item);
        this.close();
    }

    close = () =>
    {
        this.setState({
            dirty: false,
            selectingRole: false,
            item: {
                role: {
                    id: undefined,
                    color: undefined,
                    name: undefined
                },
                alias: "",
                cost: 0,
                description: ""
            }
        });
        this.props.close();
    }

    render()
    {
        return (
            <div className={"shop-item-editor"+(this.props.open?" shop-item-editor-open":"")}>
                <table>
                    <tbody>
                        <tr>
                            <td className="dashboard-table-key">Rolle</td>
                            <td className="dashboard-table-value">
                                <span style={{color: "#"+(this.state.item.role.color||0).toString(16).padStart(6, '0')}}>{this.state.item.role.name}</span>
                                <button className="settings-select-button" onClick={this.selectingRole}>Auswählen</button>
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Alias</td>
                            <td className="dashboard-table-value">
                                <input value={this.state.item.alias} type="text" name="alias" onChange={this.updateField}/>
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Preis</td>
                            <td className="dashboard-table-value">
                                <input value={this.state.item.cost} type="number" name="cost" onChange={this.updateField}/>
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key" style={{verticalAlign: 'top'}}>Beschreibung</td>
                            <td className="dashboard-table-value">
                                <textarea value={this.state.item.description} name="description" onChange={this.updateField}/>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="shop-buttons">
                    <button onClick={this.save}>Speichern</button>
                    <button onClick={this.close}>Abbrechen</button>
                </div>
                <div style={{zIndex: 10}}>
                    <RoleSelector 
                        open={this.state.selectingRole} 
                        select={this.selectRole}/>
                </div>
            </div>
        );
    }
}

class ShopItem extends React.Component
{
    render()
    {
        return (
            <div className="reminder-box">
                <table>
                    <tbody>
                        <tr>
                            <td className="dashboard-table-key">Rolle</td>
                            <td className="dashboard-table-value">
                                <span style={{color: "#"+(this.props.data.role.color||0).toString(16).padStart(6, '0')}}>{this.props.data.role.name}</span>
                            </td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Alias</td>
                            <td className="dashboard-table-value">{this.props.data.alias}</td>
                        </tr>
                        <tr>
                            <td className="dashboard-table-key">Preis</td>
                            <td className="dashboard-table-value">{this.props.data.cost} Coins</td>
                        </tr>
                    </tbody>
                </table>
                <p>
                    {replaceEmojis(this.props.data.description)}
                </p>
                <div class="shop-buttons">
                    <button
                            disabled={this.props.inventory || this.props.coins < this.props.data.cost}
                            onClick={this.props.buy}
                            style={{color: (this.props.inventory?"initial":(this.props.coins < this.props.data.cost) ? "red" : "green")}}>
                        {this.props.inventory?"✔ Gekauft":"Kaufen"}
                    </button>
                    {this.props.operator?<button onClick={this.props.edit}>Bearbeiten</button>:null}
                    {this.props.operator?<button onClick={this.props.delete}>Entfernen</button>:null}
                </div>
            </div>
        )
    }
}

class Shop extends React.Component
{
    state = {
        items: [],
        inventory: [],
        editing: false,
        editingItem : {
            role: {
            }
        },
        editingCallback: () => {}
    }

    fetchItems = () =>
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/shop/items', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({items: res.data});
        });
    }

    fetchInventory = () =>
    {
        axios.get(Config.apiUrl + '/'+this.context.guild+'/shop/inventory', 
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.setState({inventory: res.data});
        });
    }

    componentDidMount()
    {
        this.fetchItems();
        this.fetchInventory();
    }

    openCreatePopup = callback =>
    {
        this.setState({
            editing: true,
            editingItem: {
                role: {
                    id: undefined,
                    color: undefined,
                    name: undefined
                },
                alias: "",
                cost: 0,
                description: ""
            },
            editingCallback: callback
        });
    }

    openEditPopup = (item, callback) =>
    {
        console.log(item);
        this.setState({
            editing: true,
            editingItem: item,
            editingCallback: callback
        });
    }

    closePopup = event =>
    {
        if(this.state.editing === true)
        {
            this.setState({
                editing: false,
                editingItem : {
                    role: {
                    }
                },
                editingCallback: () => {}
            });
        }
    }

    addItem = item =>
    {
        axios.put(Config.apiUrl + '/'+this.context.guild+'/shop/items', item,
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.fetchItems();
        });
    }

    deleteItem = item =>
    {
        if(window.confirm('Shop-Eintrag wirklich löschen?'))
        {
            axios.delete(Config.apiUrl + '/'+this.context.guild+'/shop/items/'+item.role.id,
            {
                headers: {'Authorization': 'Bearer '+this.context.token}
            })
            .then(res => {
                this.fetchItems();
            });
        }
    }

    buyItem = item =>
    {
        axios.put(Config.apiUrl + '/'+this.context.guild+'/shop/inventory/'+item.role.id, {},
        {
            headers: {'Authorization': 'Bearer '+this.context.token}
        })
        .then(res => {
            this.props.updateUser();
            this.fetchInventory();
        });
    }

    render()
    {
        return (
            <div style={{height: 'inherit'}}>
                <div style={{float: 'left'}}>Coins: {this.props.user.coins}</div>
                {this.props.user.operator?<button onClick={() => this.openCreatePopup(this.addItem)}>Hinzufügen</button>:null}
                <div className="reminders">
                    {this.state.items.map(i => <ShopItem 
                        data={i}
                        inventory={this.state.inventory.includes(i.role.id)}
                        coins={this.props.user.coins}
                        operator={this.props.user.operator}
                        edit={this.openEditPopup.bind(null, i, this.addItem)}
                        delete={this.deleteItem.bind(null, i)}
                        buy={this.buyItem.bind(null, i)}/>)}
                </div>
                {this.props.user.operator?
                    <ShopItemEditor 
                        data={this.state.editingItem}
                        open={this.state.editing}
                        callback={this.state.editingCallback}
                        close={this.closePopup}/>
                    :null}
            </div>
        );
    }
}

Shop.contextType = MyContext;

export default Shop;
