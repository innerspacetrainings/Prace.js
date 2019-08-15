import express from 'express';
import Prace from "./Prace";
import IConfig from "./Config/IConfig";
import fs from 'fs';
import path from 'path';
import DefaultConfig from "./Config/DefaultConfig";
import ConventionEvaluator from "./ConventionEvaluator";
import IGithubApi, {RepoInfo} from "./Github/IGithubApi";

const app = express();
const port = 3000;

app.use(express.json());

export default Prace;
export {IConfig, DefaultConfig, ConventionEvaluator, RepoInfo, IGithubApi};

let config: IConfig;

const filePath = path.join(__dirname, '../appData.pem');
fs.readFile(filePath, {encoding: 'utf-8'}, function (err, data) {
    if (!err) {
        console.log('loaded private key');
        config = new DefaultConfig(null, data);
    } else {
        console.log(err);
    }
});

app.post('/', async (req, res) => {
    if (config) {
        const praceApp = Prace.Build(req.body, config);
        if (praceApp) {
            const checkExecution = await praceApp.ExecuteCheck();
            console.log(checkExecution);
        }
    }
    res.send('Hello World!')
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
