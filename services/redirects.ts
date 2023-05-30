function removeTrailingBackslash(url: string) {
    return url.replace(/\/$/, "");
}

export default function redirect(target: string, code = 307) {
  return function handler(req: Request): Response {
    const loc = [removeTrailingBackslash(req.url), target].join("/");
    return Response.redirect(loc, code);
  };
}
