/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import "./wasm_exec.js";
// @ts-expect-error
import module from "./readability.wasm";
// @ts-expect-error
const go = new Go();
WebAssembly.instantiate(module, go.importObject)
  .then((instance) => {
    go.run(instance);
  })
  .catch((err) => {
    console.error(err);
  });

declare global {
  function readabilityTextContent(
    html: string,
    url: string,
  ):
    | { readonly error: string; readonly content: undefined }
    | { readonly error: undefined; readonly content: string };
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = parseUrl(new URL(request.url).searchParams.get("url") ?? "");
    if (!url) {
      return new Response("Invalid URL", { status: 400 });
    }

    const res = await fetch(url);
    if (res.status < 200 || res.status >= 300) {
      return new Response(`Failed to fetch ${url}`, { status: 500 });
    }
    const result = readabilityTextContent(await res.text(), url.toString());
    console.log(result);
    if (result.error) {
      return new Response(result.error, { status: 500 });
    }
    return new Response(result.content, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },
} satisfies ExportedHandler<Env>;

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch (e) {
    return null;
  }
}
