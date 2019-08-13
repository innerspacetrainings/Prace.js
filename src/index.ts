import express from 'express';
import {PraceApp} from "./Github/PraceApp";
import {IConfig} from "./Config/IConfig";
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.json());

class Config implements IConfig {
    constructor(private readonly privateKey: string) {

    }

    GitHubAppId: number = 38357;

    GetParsedPrivateKey() {
        return this.privateKey;
    }
}

let config: Config = null;

const filePath = path.join(__dirname, '../appData.pem');
fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (!err) {
        console.log('received data: ' + data);
        config = new Config(data);
    } else {
        console.log(err);
    }
});


app.post('/', async (req, res) => {
    var praceApp = PraceApp.BuildPraceApp(req.body, config);
    res.send('Hello World!')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
