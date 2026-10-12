import { telemetryUrl } from "@/lib/security/telemetry";
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.05,
      beforeSend(event) {
        if (event.request) {
          if (event.request.url)
            event.request.url = telemetryUrl(event.request.url);
          event.request.data = undefined;
          event.request.headers = {};
        }
        event.user = undefined;
        return event;
      },
    });
  }
}
