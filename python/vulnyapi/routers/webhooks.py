import httpx
from fastapi import APIRouter, HTTPException, status

from helpers.auth import CurrentUser
from models.requests import WebhookTestRequest
from models.responses import WebhookResult

webhooks_router = APIRouter(tags=["webhooks"])

WEBHOOK_TIMEOUT_S = 5.0


@webhooks_router.post("/test", response_model=WebhookResult)
def test_webhook(req: WebhookTestRequest, _: CurrentUser):
    """Send the supplied JSON payload to `req.url` and return the response.

    Useful for verifying that a third-party endpoint is reachable from the
    service before saving it as a real webhook.
    """
    try:
        resp = httpx.post(
            req.url, json=req.payload or {}, timeout=WEBHOOK_TIMEOUT_S
        )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)
        )
    return WebhookResult(status=resp.status_code, body=resp.text[:2000])
