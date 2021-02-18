import { Config } from "./partial";
import Route, { ReConfig } from "./Route";
import http from "http";
import { parse } from "url";
import { ExtraConfig, Request } from "./types";

// @ts-ignore
import simplex from "simple-path-expressions";
import combineRoutes from "./combineRoutes";
import httpListener from "./httpListener";

export default async function createServer({
  port,
  listener,
}: {
  port?: number;
  listener: ReturnType<typeof httpListener>;
}) {
  const server = http.createServer(async (request, response) => {
    const { url = "", method = "" } = request;

    const resolved = listener.resolve(url, method);

    if (resolved) {
      let data: unknown;
      let error: unknown;

      const query = parse(url, true).query;
      const [params, { exit, entry, effect, service }] = resolved;
      const req: Request = Object.assign({ query, params }, request);

      await Promise.all(
        entry.map((fn) => {
          return fn(req, response);
        })
      );

      try {
        const res = service?.src(req);
        data = service?.onDone?.(req, { data: res });
      } catch (error) {
        error = service?.onError?.(req, { data: error });
      }

      effect(req, response, { data, error });

      await Promise.all(
        exit.map((fn) => {
          return fn(req, response);
        })
      );
    } else {
      console.log(`cannot ${method} ${url}`);
      response.write(`cannot ${method} ${url}`);
      response.end();
    }
  });

  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      resolve(null);
    });
  });
}
