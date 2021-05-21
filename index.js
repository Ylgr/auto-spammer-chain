const {GlitchWeb3} = require('@glitchdefi/web3');
require('dotenv').config();
const CronJob = require('cron').CronJob;

const gweb3Providers = process.env.BLOCKCHAIN_RPC.split(',').map(e => new GlitchWeb3(e))
let countSpam = 0
async function faucetAndAddToWallet() {
    for(const gweb3 of gweb3Providers) {
        gweb3.wallet.importAccount('F28JJMw61xbs7GQ6uhZPrQ7pMUQxZPj7V3E5GW9cMeib') // tglc1a9yfs7e7ev2p7jad9kquwtvxpcznnec422udrk
        gweb3.wallet.importAccount('J87phy65aXEpTKzZVeWZAZu7j3ooG1qWBvwihM2kduyU') // tglc1lrnqzvplc23hrcn3ndy995xttdm9q6a9d098ht
        gweb3.wallet.importAccount('Eq5QRGtuaRGBaH2cLQHypwqotiVhAWAEYMrezJeXYHTn') // tglc1acy0cxm7tqdasrvqpdald80qcseyqdcrcw6zlx
    }
    const faucetContract = gweb3Providers[0].contract('system.faucet');

    await faucetContract.methods.request().sendCommit({
        signers: 'tglc1acy0cxm7tqdasrvqpdald80qcseyqdcrcw6zlx',
        payer: 'system.faucet',
        fee: 5460000000000n
    })
}

async function boardcastSpammer() {
    console.log(new Date().toString())
    console.log('Spam number ', ++countSpam)

    let reqs = []
    const nonce = await gweb3Providers[0].getNonce()
    const tx = {
        from: 'tglc1acy0cxm7tqdasrvqpdald80qcseyqdcrcw6zlx',
        to: 'tglc1lrnqzvplc23hrcn3ndy995xttdm9q6a9d098ht',
        payer: 'tglc1acy0cxm7tqdasrvqpdald80qcseyqdcrcw6zlx',
        value: 15000000000000,
        fee: 5000000000000,
        nonce: nonce
    }
    for(const gweb3 of gweb3Providers) {
        reqs.push(gweb3.sendTransaction(tx,'tglc1acy0cxm7tqdasrvqpdald80qcseyqdcrcw6zlx'))
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

    const job = new CronJob('6 * * * * *', async function() {
        await boardcastSpammer();
    }, null, true, 'America/Los_Angeles');
    job.start();
})()