import 'regenerator-runtime/runtime'

import { initContract, login, logout } from './utils'

import getConfig from './config'
import BN from 'bn.js'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

import * as nearAPI from "near-api-js";
const { utils, connect, providers } = nearAPI;
const amountInYocto = utils.format.parseNearAmount("1");

const submitButton = document.querySelector('form button')

let current;

document.querySelector('form').onsubmit = async (event) => {
  event.preventDefault()

  try {
    // make an update call to the smart contract
    
    //let transaction = await window.contract.play({amount: 1})
    console.log(await window.contract.play({},
      '300000000000000', // attached GAS (optional)
      '1000000000000000000000000' // attached deposit in yoctoNEAR (optional)
    ))

  } catch (e) {
    alert(
      'Something went wrong! ' +
      'Maybe you need to sign out and back in? ' +
      'Check your browser console for more info.'
    )
    throw e
  } finally {
    console.log('done')
  }

}

document.querySelector('#sign-in-button').onclick = login
document.querySelector('#sign-out-button').onclick = logout

// Display the signed-out-flow container
function signedOutFlow() {
  document.querySelector('#signed-out-flow').style.display = 'block'
}

// Displaying the signed in flow container and fill in account-specific data
async function signedInFlow() {
  document.querySelector('#signed-in-flow').style.display = 'block'

  document.querySelectorAll('[data-behavior=account-id]').forEach(el => {
    el.innerText = window.accountId
  })

  // populate links in the notification box
  const accountLink = document.querySelector('[data-behavior=notification] a:nth-of-type(1)')
  accountLink.href = accountLink.href + window.accountId
  accountLink.innerText = '@' + window.accountId
  const contractLink = document.querySelector('[data-behavior=notification] a:nth-of-type(2)')
  contractLink.href = contractLink.href + window.contract.contractId
  contractLink.innerText = '@' + window.contract.contractId

  // update with selected networkId
  accountLink.href = accountLink.href.replace('testnet', networkId)
  contractLink.href = contractLink.href.replace('testnet', networkId)

  let balance = (await window.walletConnection._connectedAccount.getAccountBalance()).available / 1000000000000000000000000;
  document.querySelector('#balance').innerText += "Balance : " + balance.toFixed(2);


  const near = await connect(window.walletConnection._near.config);
  const account = await near.account(window.walletConnection._near.config.contractName);
  

  balance = (await account.getAccountBalance()).available / 1000000000000000000000000;
  document.querySelector('#contract-balance').innerText += "Contract Balance : " + balance.toFixed(2);

  const provider = new providers.JsonRpcProvider(
    "https://archival-rpc.testnet.near.org"
  );

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = urlSearchParams.get('transactionHashes');

  console.log(params);
  
  const result = await provider.txStatus(params, window.walletConnection._near.config.contractName);
  console.log(result.receipts_outcome[0].outcome.logs[2]);
  document.querySelector('#status').innerText = result.receipts_outcome[0].outcome.logs[2]
  setTimeout(() => {
    document.querySelector('#status').innerText = ''
  }, 11000)
}

// `nearInitPromise` gets called on page load
window.nearInitPromise = initContract()
  .then(() => {
    if (window.walletConnection.isSignedIn()) signedInFlow()
    else signedOutFlow()
  })
  .catch(console.error)
