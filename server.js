import Koa from 'koa';
import { koaBody } from 'koa-body';
import { router } from './router/index.mjs';

const app = new Koa();

app.use(koaBody({ multipart: true, urlencoded: true, json: true }));
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT}`);
});
