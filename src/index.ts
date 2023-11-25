export interface Env {
	KV: KVNamespace;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const method = request.method;
		if (method === 'POST') {
			const formdata = await request.formData();
			const url = formdata.get('url');
			const path = crypto.randomUUID().slice(0, 3);
			if (url) {
				await env.KV.put(path, url);
				return new Response(new URL(request.url).origin + '/' + path);
			}
		} else {
			const path = new URL(request.url).pathname.slice(1);
			if (path !== '') {
				const url = await env.KV.get(path);
				if (url) {
					return new Response('redirecting', { status: 303, headers: { Location: url } });
				}
			}
		}
		return new Response(
			`<form method="POST"><label for="url">url</label><input name="url" type="url" required /><button>submit</button></form>`,
			{ headers: { 'Content-Type': 'text/html' } }
		);
	},
};
