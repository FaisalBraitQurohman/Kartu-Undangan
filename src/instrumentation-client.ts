import * as Sentry from "@sentry/nextjs";
import { telemetryUrl } from "@/lib/security/telemetry";
if (process.env.NEXT_PUBLIC_SENTRY_DSN)
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
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
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.data)
        for (const key of ["url", "from", "to"])
          if (typeof breadcrumb.data[key] === "string")
            breadcrumb.data[key] = telemetryUrl(breadcrumb.data[key]);
      return breadcrumb;
    },
  });
