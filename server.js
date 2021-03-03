const express = require('express');

require('dotenv').config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const app = express();
const path = require('path');
const port = process.env.PORT || 3500;
const cors = require('cors');

app.use(cors());

app.use(express.static(path.join(__dirname, 'build')));



app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build'));
});

app.get('/send-text', (req, res) => {

    const { phoneNumber, message} = req.query;

    client.messages
    .create({
        body: message,
        from: '+13235151566',
        to: phoneNumber
    })
    .then(message => console.log(message.body))
    .catch(err => console.log(err));


})


app.listen(port, () => console.log(`Running on port ${port}`));