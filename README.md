# PRACE

Pull Request Automated Convention Enforcer

<p align="center"> 
<img src="media/prace-logo.png" width="250"  height="250">
</p>

Checks that the PR title complies with a given Regular expression.

## Example usage with Express

```typescript
import express from 'express';
import Prace from "./Prace";
import DefaultConfig from "./Config/DefaultConfig";

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
