import { Hono } from "hono";
import { Bindings, Tenant, ContactPointType, PullRequest } from "./types";
import { sendMessageToDiscord } from "./discord";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.json({ message: "Review Noi API" });
});

// webhook from github
app.post(":tenantId/webhook", async (c) => {
  const tenantId = c.req.param("tenantId");
  const tenantStr = await c.env.REVIEW_NOI.get<string>(`tenant:${tenantId}`);
  if (!tenantStr) {
    return c.json(
      {
        code: "TENANT_NOT_FOUND",
        message: "tenant not found",
      },
      404
    );
  }
  const tenant: Tenant = JSON.parse(tenantStr);

  // extract the payload from the request
  const githubEvent = c.req.header("X-GitHub-Event");
  if (githubEvent === "ping") {
    return c.json({ message: "pong" });
  }
  if (githubEvent !== "pull_request") {
    return c.json({ message: "event not supported" }, 400);
  }

  const payload = await c.req.json<PullRequest>();
  if (payload.action !== "opened") {
    return c.json({ message: "action not supported" });
  }

  const userMap = tenant.contactPoint.userMap || {};

  const author = payload.pull_request.user.login;
  const authorDiscordUid = userMap[author] || author;
  const reviewer =
    payload.pull_request.requested_reviewers.length > 0
      ? payload.pull_request.requested_reviewers[0].login
      : "none";
  const reviewerDiscordUid = userMap[reviewer] || "here";

  const mention =
    reviewerDiscordUid === "here" ? "@here" : `<@${reviewerDiscordUid}>`;

  const message = `${mention} ฝากรีวิว PR [[${payload.repository.full_name}](${payload.repository.html_url})] [#${payload.number} ${payload.pull_request.title}](${payload.pull_request.html_url}) ของ <@${authorDiscordUid}> หน่อยจ้า`;

  // send the payload to the contact point
  const contactPoint = tenant.contactPoint;
  if (contactPoint.type === ContactPointType.DISCORD) {
    await sendMessageToDiscord({
      webhookUrl: contactPoint.webhookUrl,
      message: message,
    });

    return c.json({ message: "message sent to discord" });
  }

  return c.json({ message: "contact point not supported" }, 400);
});

export default app;
