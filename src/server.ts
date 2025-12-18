import { createApp } from "./app.js";
import { env } from "./config/env.js";
createApp().listen(env.PORT, ()=>console.log(`[server] :${env.PORT} prefix=${env.API_PREFIX}`));
