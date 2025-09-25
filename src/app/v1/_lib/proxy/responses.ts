export class ProxyResponses {
  static buildError(status: number, message: string): Response {
    const payload = {
      error: {
        message,
        type: String(status)
      }
    };

    return new Response(JSON.stringify(payload), {
      status,
      headers: {
        "content-type": "application/json; charset=utf-8"
      }
    });
  }
}
