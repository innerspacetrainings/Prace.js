# Prace.js

Pull Request Automated Convention Enforcer

<p align="center"> 
<img src="media/prace-logo.png" width="250"  height="250">
<!--img src="https://raw.githubusercontent.com/innerspacetrainings/Prace.js/master/media/prace-logo.png" width="250"  height="250"-->
</p>

Checks that the PR title complies with a given regular expression.

[![CircleCI](https://circleci.com/gh/innerspacetrainings/Prace.js.svg?style=svg&circle-token=b65ff8f34c4b5bfd19e6a3ab17b3ece352e25b73)](https://circleci.com/gh/innerspacetrainings/Prace.js)

## Repository configuration file

A file named `.prace` must be added to the project.

That file must only contain one line with a regular expression.

An example to keep the following convention: `[XX-123] Here goes a description` is the following regular expression:
```regexp
\[XX-\d*\]\s[\w\s]*
```

## Getting started

If you want to host your own instance you can include prace in express or other common JavaScript web frameworks.

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
 - Create a base node project
 - Run `npm install --save prace express`.
 - Add your [Github App id](https://developer.github.com/v3/apps/) to the environment variable: `GITHUB_APP_ID`
 - Add your [Github private key](https://developer.github.com/apps/building-github-apps/authenticating-with-github-apps/#generating-a-private-key) to the environment variable `GITHUB_PRIVATE_KEY`.
 - Copy the following script and deploy it:

```javascript
const Prace = require('prace');
const express = require('express');

const prace = Prace.Prace;
const defaultConfig = Prace.DefaultConfig;

const app = express();
const port = 3000;

// IMPORTANT. GitHub sends the body in a json
app.use(express.json());
const config = new DefaultConfig();

app.post('/', (req, res) => {
  const praceApp = prace.Build(req.body, config);

  if (praceApp) {
    praceApp.executeCheck()
      .then(result => {
        console.log('Executed with result', result);
        res.send('Received!');
      })
      .catch(err => {
        console.warn('Failed with error', err);
        res.send('Failed to execute');
      });
  } else {
    console.warn('Could not instantiate prace app');
    res.send('Nothing happened');
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
```

 - Finally, set the [Webhook URL](https://developer.github.com/webhooks/) of your GitHub app to your server url.

#### More configurations

You can configure more of the functionalities of Prace or set up a more advanced configuration file instead of the default config.

That way you can use your own logger, request client or load the private key from a different source.

This is the interface for it:
```typescript
/** Interface with all the configurations for the project */
interface IConfig {
    /** ID given by github to define the App id */
    gitHubAppId: number;
    /** Name of the status check. Appears on the status section of Github's Pull request */
    checkName: string;
    /** Logger to which the app send messages. */
    logger: ILogger;
    /** Class in charge of requesting the github api for the .prace file through a https call */
    request: IRequest;

    /** The App private key. This method is awaited, so the file can be loaded from an external source */
    getParsedPrivateKey(): Promise<string>;
}

interface ILogger {
    log(message: string, ...optionalParams: any[]): void;

    warn(message: string, ...optionalParams: any[]): void;

    error(message: string, error?: Error): void;
}

export enum TemplateResult {
    Success = 'success',
    NoPraceFile = 'noPraceFile',
    InvalidFormat = 'invalidFormat',
    UnknownError = 'unknownError'
}

export interface TemplateFetchResult {
    regularExpression?: string;
    result: TemplateResult
}

/** Class in charge of fetching the content of the .prace file inside the repo. */
export interface IRequest {
    request(options: { uri: string, headers: any }): Promise<TemplateFetchResult>;
}
```

#### Object to send to prace

By default Prace handles a json object with the pull request data. 
It must be a [GitHub webhook payload for a Pull Request](https://developer.github.com/v3/activity/events/types/#pullrequestevent). 

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
