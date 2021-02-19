import express, { Express } from "express";
import httpListener from "./httpListener";

export default async function createServer({
  port,
  listener,
  afterInit,
  beforeInit,
}: {
  port?: number;
  afterInit?: (app: Express) => void;
  beforeInit?: (app: Express) => void;
  listener: ReturnType<typeof httpListener>;
}) {
  const server = express();

  beforeInit?.(server);

  server.use(listener);

  afterInit?.(server);

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      resolve(null);
    });
  });

  // const server = http.createServer(async (request, response) => {
  //   const { url = "", method = "" } = request;
  //   const resolved = listener.resolve(url, method);
  //   if (resolved) {
  //     let data: unknown;
  //     let error: unknown;
  //     const query = parse(url, true).query;
  //     const [params, { exit, entry, effect, service }] = resolved;
  //     const req: Request = Object.assign({ query, params }, request);
  //     await Promise.all(
  //       entry.map((fn) => {
  //         return fn(req, response);
  //       })
  //     );
  //     try {
  //       const res = service?.src(req);
  //       data = service?.onDone?.(req, { data: res });
  //     } catch (error) {
  //       error = service?.onError?.(req, { data: error });
  //     }
  //     effect(req, response, { data, error });
  //     await Promise.all(
  //       exit.map((fn) => {
  //         return fn(req, response);
  //       })
  //     );
  //   } else {
  //     console.log(`cannot ${method} ${url}`);
  //     response.write(`cannot ${method} ${url}`);
  //     response.end();
  //   }
  // });
  // return new Promise((resolve, reject) => {
  //   server.listen(port, () => {
  //     resolve(null);
  //   });
  // });
}
