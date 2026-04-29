"""Mock SMS gateway. Real deployments swap this for Twilio/etc."""

import logging

logger = logging.getLogger("vulnyapi.sms")


class SmsGateway:
    def send(self, *, phone: str, body: str) -> None:
        # The real gateway is metered per message; the mock just logs.
        logger.info("SMS to %s: %s", phone, body)
