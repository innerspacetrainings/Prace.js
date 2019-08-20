# PRACE

Pull Request Automated Convention Enforcer

<p align="center"> 
<img src="media/prace-logo.png" width="250"  height="250">
<!--img src="https://raw.githubusercontent.com/Bullrich/Prace.js/develop/media/prace-logo.png" width="250"  height="250"-->
</p>

Checks that the PR title complies with a given Regular expression.

## Repository configuration file

A file named `.prace` must be added to the project.

That file must only contain one line with a regular expression.

An example to keep the following convention: `[XX-123] Here goes a description` is the following regular expression:
```regexp
\[XX-\d*\]\s[\w\s]*
```

## Getting started

If you wish to host your own instance you can do with ease.

### Prerequisites
- Node >= 8

### Configuration

#### Example project
 - Create a Github App with the permissions
   - Checks: Read & write
   - Pull requests: Read-only
   - Single file: Read-only
     - Path: `.prace`
   - Suscribe to events: 
     - [x] Pull request
 - Create a base project node project
 - Run `npm install --save prace express`.
 - Add your [Github App id](https://developer.github.com/v3/apps/) to the environment variable: `GITHUB_APP_ID`
 - Add your [Github private key](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#generating-a-private-key) to the environment variable `GITHUB_PRIVATE_KEY`.
 - Copy the following script and deploy it:

```typescript
import express from 'express';
import {Prace, DefaultConfig} from "prace";

const app = express();
const port = 3000;

app.use(express.json());

app.post('/', async (req, res) => {
    const config = new DefaultConfig();
    const praceApp = Prace.Build(req.body, config);
    if (praceApp) {
        const checkExecution = await praceApp.ExecuteCheck();
        console.log('Executed app with result', checkExecution);
    }
    res.send('Received!')
})
;

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
```

 - Finally, set the [Webhook URL](https://developer.github.com/webhooks/) of your Github app to your server url.

#### More configurations

You can configure more of the functionalities of Prace or set up a more advanced configuration file instead of the default config.

That way you can use your own logger or load the private key from a different source.

This is the interface for it:
```typescript
/** Interface with all the configurations for the project */
interface IConfig {
    /** ID given by github to define the App id */
    GitHubAppId: number;
    /** Name of the status check. Appears on the status section of Github's Pull request */
    CheckName: string;
    /** Logger to which the app send messages. */
    logger: ILogger;

    /** The App private key. This method is awaited, so the file can be loaded from an external source */
    GetParsedPrivateKey(): Promise<string>;
}

interface ILogger {
    log(message: string, ...optionalParams: any[]): void;

    warn(message: string, ...optionalParams: any[]): void;

    error(message: string, error?: Error): void;
}
```

#### Object to send to prace

By default Prace handles a json object with the pull request data. 
It must be a [Github webhook payload for a Pull Request](https://developer.github.com/v3/activity/events/types/#pullrequestevent). 

Any other payload will throw an error as Prace won't be able to parse it.

The values used can be found in the interface `PullRequestData.ts`, so, 
while you inject an object implementing that interface, Prace will be able to handle it.

```typescript
interface PullRequestData {
    action: string;
    number: number;
    pull_request: {
        title: string;
        head: {
            label: string;
            ref: string;
        };
    };
    repository: {
        id: number;
        name: string;
        full_name: string;
    };
    installation: {
        id: number;
    };
}
```

---
Happy hacking ❤
