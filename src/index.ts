import {app} from "./app";
import {SETTINGS} from "./utils/settings";
import {runDb} from "./repositories/db";

const startApp = async () => {
    await runDb();
    app.listen(SETTINGS.PORT, () => {
        console.log(`Example app listening on port ${SETTINGS.PORT}`);
    })
}

startApp();