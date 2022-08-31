import React, { Component } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import myNFT from '../abis/MyNFT.json'
import {MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBCardImage, MDBBtn} from 'mdb-react-ui-kit';
import './App.css';

class App extends Component {

    async componentDidMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
    }

    // first up is to detect ethereum provider
    async loadWeb3() {
        const provider = await detectEthereumProvider();

        if(provider) {
            console.log('ethereum wallet is connected')
            window.web3 = new Web3(provider)
        } else {
            // no ethereum provider
            console.log('no ethereum wallet detected')
        }
    }

    async loadBlockchainData() {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        this.setState({account:accounts[0]})

        const networkId = await web3.eth.net.getId()
        const networkData = myNFT.networks[networkId]
         if(networkData) {

             const abi = myNFT.abi;
             const address = networkData.address; 
             const contract = new web3.eth.Contract(abi, address)
             this.setState({contract})

            const totalSupply = await contract.methods.totalSupply().call()
            this.setState({totalSupply})

            for(let i = 1; i <= totalSupply; i++) {
                const myNFT = await contract.methods.nfts(i - 1).call()
                const owner = await contract.methods.ownerOf(i-1).call();
                this.setState({
                    nfts:[...this.state.nfts, myNFT]
                })
                this.setState({
                    ownerOfNfts :[...this.state.ownerOfNfts,owner]
                })
            }
         } else {
             window.alert('Smart contract not deployed')
         }
    }

    // with minting we are sending information and we need to specify the account
    transferToken = (tokenNumber, accountId) =>{
        console.log(tokenNumber-1)
        console.log(accountId)
        if(this.state.account !== this.state.ownerOfNfts[tokenNumber-1]){
            alert("You are Not the Owner of This NFT");
            return;
        }
        const confirmation = window.confirm("Confirm this Trasaction");
        if(confirmation){
            this.state.contract.methods.transferFrom(this.state.account,accountId,tokenNumber-1).send({from:this.state.account})
            .once('receipt',(receipt)=>{
                console.log(receipt)
            })
        }
    }
    mint = (myNFT) => {
            this.state.contract.methods.mint(myNFT).send({from:this.state.account})
        .once('receipt', (receipt)=> {
            this.setState({
                nfts:[...this.state.nfts, myNFT]
            })
            this.setState({
                ownerOfNfts:[...this.state.ownerOfNfts,this.state.account]
            })
        })  
    }

    constructor(props) {
         super(props);
         this.state = {
             account: '',
             contract:null,
             totalSupply:0,
             nfts:[],
             ownerOfNfts:[]
         }
    }

            // BUILDING THE MINTING FORM
            // 1. Create a text input with a place holder 
            //'add file location'
            // 2. Create another input button with the type submit

    render() {
        return (
            <div className='container-filled'>
                {console.log(this.state.nfts)}
                {console.log(this.state.account)}
                <nav className='navbar navbar-dark fixed-top 
                bg-dark flex-md-nowrap p-0 shadow'>
                <div className='navbar-brand col-sm-1 col-md-1
                mr-0' style={{color:'white'}}>
                Non Fungible Tokens
                </div>
                <ul className='navbar-nav px-3'>
                <li className='nav-item text-nowrap
                d-none d-sm-none d-sm-block
                '>
                <small className='text-white'>
                    {this.state.account}
                </small>
                </li>
                </ul>
                </nav>

                <div className='container-fluid mt-1'>
                    <div className='row'>
                        <main role='main' 
                        className='col-lg-12 d-flex text-center'>
                            <div className='content mr-auto ml-auto'
                            style={{opacity:'0.8'}}>
                                <h1 style={{color:'black'}}>
                                    Mint your NFT here</h1>
                            <form onSubmit={(event)=>{
                                event.preventDefault()
                                const myNFT = this.myNFT.value
                                this.mint(myNFT)
                            }}>
                                <input
                                type='text'
                                placeholder='Add a file location'
                                className='form-control mb-1'
                                ref={(input)=>this.myNFT = input}
                                />
                                <input style={{margin:'6px'}}
                                type='submit'
                                className='btn btn-primary btn-black'
                                value='MINT'
                                />
                                </form>
                            </div>
                            <div className='content mr-auto ml-auto'
                            style={{opacity:'0.8'}}>
                                <h1 style={{color:'black'}}>
                                    Transfer NFT</h1>
                            <form onSubmit={(event)=>{
                                event.preventDefault()
                                const tokenToSend = this.tokenToSend.value
                                const IdToSend = this.IdToSend.value
                                this.transferToken(tokenToSend,IdToSend)
                            }}>
                                <input
                                type='number'
                                placeholder='Token Number'
                                className='form-control mb-1'
                                ref={(input)=>this.tokenToSend = input}
                                />
                                <input
                                type='text'
                                placeholder='Account Number'
                                className='form-control mb-1'
                                ref={(input)=>this.IdToSend = input}
                                />
                                <input style={{margin:'6px'}}
                                type='submit'
                                className='btn btn-primary btn-black'
                                value='SEND'
                                />
                                
                                </form>
                            </div>
                        </main>
                    </div>
                        <hr></hr>
                        <div className='row textCenter'>
                            {this.state.nfts.map((myNFT, key)=>{
                                return(
                                    <div >
                                        <div>
                                            <MDBCard className='token img' style={{maxWidth:'22rem'}}>
                                            <MDBCardImage src={myNFT}  position='top' height='250rem' style={{marginRight:'4px'}} />
                                            <MDBCardBody>
                                            <MDBCardTitle> Token {key+1} </MDBCardTitle> 
                                            <MDBCardText> Owner is {this.state.ownerOfNfts[key]} </MDBCardText>
                                            <MDBBtn href={myNFT}>Download</MDBBtn>
                                            </MDBCardBody>
                                            </MDBCard>
                                             </div>
                                    </div>
                                )
                            })} 
                        </div>
                </div>
            </div>
        )
    }
}

export default App;