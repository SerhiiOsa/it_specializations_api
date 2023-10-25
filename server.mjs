import Koa from 'koa';
import 'dotenv/config';
import { koaBody } from 'koa-body';
import { router } from './src/routes/admin.mjs';
import pkg from 'koa-cors';

const app = new Koa();

const cors = pkg;

app.use(koaBody({ multipart: true, urlencoded: true, json: true }));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(cors());

app.listen(process.env.SERVER_PORT, () => {
    console.log(
        `Server is running on http://localhost:${process.env.SERVER_PORT}`
    );
});
