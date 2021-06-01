const {IceteaWeb3} = require('@iceteachain/web3');
require('dotenv').config();
const CronJob = require('cron').CronJob;

const gweb3Providers = process.env.BLOCKCHAIN_RPC.split(',').map(e => new IceteaWeb3(e))
let countSpam = 0
async function faucetAndAddToWallet() {
    for(const gweb3 of gweb3Providers) {
        gweb3.wallet.importAccount('F28JJMw61xbs7GQ6uhZPrQ7pMUQxZPj7V3E5GW9cMeib') // teat1a9yfs7e7ev2p7jad9kquwtvxpcznnec4lrufd5
        gweb3.wallet.importAccount('J87phy65aXEpTKzZVeWZAZu7j3ooG1qWBvwihM2kduyU') // teat1lrnqzvplc23hrcn3ndy995xttdm9q6a9cx9ref
        gweb3.wallet.importAccount('Eq5QRGtuaRGBaH2cLQHypwqotiVhAWAEYMrezJeXYHTn') // teat1a9yfs7e7ev2p7jad9kquwtvxpcznnec4lrufd5
    }
    const faucetContract = gweb3Providers[0].contract('system.faucet');

    await faucetContract.methods.request().sendCommit({
        signers: 'teat1a9yfs7e7ev2p7jad9kquwtvxpcznnec4lrufd5',
        payer: 'system.faucet'
    })
}

async function boardcastSpammer() {
    console.log(new Date().toString())
    console.log('Spam number ', ++countSpam)

    let reqs = []
    // const nonce = await gweb3Providers[0].getNonce()
    // const tx = {
    //     from: 'teat1a9yfs7e7ev2p7jad9kquwtvxpcznnec4lrufd5',
    //     to: 'teat1lrnqzvplc23hrcn3ndy995xttdm9q6a9cx9ref',
    //     payer: 'teat1a9yfs7e7ev2p7jad9kquwtvxpcznnec4lrufd5',
    //     value: 15000000000000,
    //     fee: 5000000000000,
    //     nonce: nonce
    // }
    for(const gweb3 of gweb3Providers) {
        reqs.push(gweb3.transfer('teat1lrnqzvplc23hrcn3ndy995xttdm9q6a9cx9ref',15,'teat1a9yfs7e7ev2p7jad9kquwtvxpcznnec4lrufd5'))
    }
    try {
        await Promise.all(reqs)
    } catch (e) {
        // Do nothing
    }
}

(async () => {
    try {
        await faucetAndAddToWallet()
    } catch (e) {
        console.log('Faucet fail: ', e.message)
    }

    const job = new CronJob('* * * * * *', async function() {
        await boardcastSpammer();
    }, null, true, 'America/Los_Angeles');
    job.start();
})()
