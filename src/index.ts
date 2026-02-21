require('dotenv').config();
import express from 'express';
import { burnTokens, mintTokens, sendNativeTokens } from './mintTokens';

const app = express();
app.use(express.json());

app.post('/helius', async (req, res) => {
    const fromAddress = req.body.fromAddress;
    const toAddress = req.body.toAddress;
    const amount = req.body.amount;
    const type = req.body.type;

    try {
        if (type === "received_native_sol") {
            await mintTokens(fromAddress, toAddress, amount);
        } else {
            // When we receive LST tokens, we burn them and send back SOL
            await burnTokens(fromAddress, toAddress, amount);
            await sendNativeTokens(toAddress, fromAddress, amount);
        }
        res.send('Transaction successful');
    } catch (e) {
        console.error(e);
        res.status(500).send('Transaction failed');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});