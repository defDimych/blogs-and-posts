import {app} from "./app";
import {SETTINGS} from "./utils/settings";
import {runDb} from "./db/run-db";


app.set("trust proxy", true);

const startApp = async () => {
    await runDb(SETTINGS.MONGO_URI);
    app.listen(SETTINGS.PORT, () => {
        console.log(`Example app listening on port ${SETTINGS.PORT}`);
    })
}

startApp();