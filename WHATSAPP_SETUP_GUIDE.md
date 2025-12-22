# 📱 WhatsApp Integration Setup Guide

## Overview
This guide will help you set up live WhatsApp messaging for your Flight Tracker Dashboard. When claims are paid, actual WhatsApp messages will be sent to travellers.

---

## 🚀 Quick Setup Steps

### Step 1: Create Twilio Account
1. Go to: https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Complete phone verification
4. You'll receive **$15 free credit** for testing

### Step 2: Access Twilio Console
1. Login to Twilio Console: https://console.twilio.com/
2. You'll see your dashboard

### Step 3: Get Your API Credentials
From the Twilio Console Dashboard:

1. **Account SID** (starts with AC...)
   - Visible on the dashboard
   - Example: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **Auth Token** (click "show" to reveal)
   - Click the eye icon to reveal
   - Example: `your_auth_token_here`

3. Copy both values - you'll need them!

### Step 4: Set Up WhatsApp Sandbox (For Testing)

1. In Twilio Console, navigate to:
   - **Messaging** → **Try it out** → **Send a WhatsApp message**

2. You'll see the **WhatsApp Sandbox** page with:
   - **Sandbox Number**: e.g., `+1 415 523 8886`
   - **Join Code**: e.g., `join happy-tiger`

3. **Join the Sandbox on Your Phone:**
   - Open WhatsApp on your mobile
   - Send a message to the sandbox number with the join code
   - Example: Send `join happy-tiger` to `+1 415 523 8886`
   - You'll receive a confirmation message

4. **Copy the Sandbox Number:**
   - Format: `whatsapp:+14155238886` (with `whatsapp:` prefix)

---

## 🔧 Configure Your Application

### Update Backend Environment Variables

1. Open the file: `/app/backend/.env`

2. Replace the placeholder values with your actual credentials:

```env
# Twilio WhatsApp Configuration
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_actual_auth_token_here"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
```

### Restart the Backend

After updating the .env file:

```bash
sudo supervisorctl restart backend
```

---

## ✅ Test the Integration

### Automatic Test (30 seconds)
The app automatically sends a WhatsApp message 30 seconds after page load:
- Flight SQ656 (Jolene Chua) gets a claim update
- WhatsApp message is sent to: `+6598741945`
- Message includes claim details and amount

### Message Format
```
A new claim has successfully been paid.

Claim Number: CLM-TRV-2026-008431
Flight: SQ656
Traveller: Jolene Chua
Amount Paid: $100

Thank you for choosing Income Insurance!
```

### What to Expect:
1. ✅ The flight row will be highlighted in light orange
2. ✅ A WhatsApp notification popup appears on screen
3. ✅ Actual WhatsApp message sent to the phone number
4. ✅ Check the recipient's WhatsApp for the message

---

## 📞 Update Phone Numbers

Phone numbers are stored in the flight data. To change them:

1. Open: `/app/frontend/src/components/FlightBoard.jsx`
2. Find the flight data (around line 23)
3. Update the `phoneNumber` field:

```javascript
{
  id: 1,
  policyNumber: 'TRV-2026-001487',
  travellers: 'Jolene Chua',
  phoneNumber: '+6598741945', // ← Change this
  flightNumber: 'SQ656',
  // ...
}
```

**Phone Number Format:**
- Must include country code
- Format: `+[country code][phone number]`
- Example Singapore: `+6591234567`
- Example US: `+14155551234`

---

## 🔄 Moving to Production

### Get a Dedicated WhatsApp Business Number

1. In Twilio Console, go to:
   - **Phone Numbers** → **Buy a number**

2. Purchase a number with SMS/WhatsApp capabilities

3. Request WhatsApp Business API access:
   - **Messaging** → **Services** → **Create Service**
   - Follow the approval process (1-3 days)

4. Update `.env` with your new number:
```env
TWILIO_WHATSAPP_NUMBER="whatsapp:+1234567890"
```

---

## 🐛 Troubleshooting

### Issue: "Mock message sent"
**Cause:** Twilio credentials not configured
**Fix:** 
1. Check `/app/backend/.env` has correct values
2. Restart backend: `sudo supervisorctl restart backend`
3. Check logs: `tail -n 50 /var/log/supervisor/backend.out.log`

### Issue: "Failed to send WhatsApp message"
**Cause:** Recipient hasn't joined sandbox
**Fix:**
1. Recipient must send join code to sandbox number
2. Wait for confirmation message
3. Try again

### Issue: Message not received
**Check:**
1. ✅ Phone number format is correct (with + and country code)
2. ✅ Recipient has joined the sandbox
3. ✅ Twilio account has sufficient credit
4. ✅ Check Twilio Console logs for delivery status

### View Backend Logs
```bash
tail -n 100 /var/log/supervisor/backend.out.log
```

---

## 💰 Pricing

### Twilio WhatsApp Pricing:
- **Free Trial**: $15 credit included
- **Per Message**: ~$0.005 USD per message
- **Session Pricing**: 24-hour conversation window
- **Check latest**: https://www.twilio.com/whatsapp/pricing

### Cost Example:
- 1,000 messages = ~$5 USD
- 10,000 messages = ~$50 USD

---

## 🎯 Current Implementation

### Features Implemented:
✅ Backend API endpoint: `/api/send-whatsapp`
✅ Twilio SDK integration
✅ Automatic WhatsApp sending on claim payment
✅ Phone numbers in flight data
✅ Mock mode for development (without credentials)
✅ Error handling and logging
✅ Message templates with claim details
✅ Visual notification popup

### Files Modified:
- `/app/backend/server.py` - WhatsApp API endpoint
- `/app/backend/.env` - Twilio credentials
- `/app/backend/requirements.txt` - Twilio SDK
- `/app/frontend/src/components/FlightBoard.jsx` - Integration logic

---

## 📞 Support

### Need Help?
1. **Twilio Support**: https://support.twilio.com/
2. **Documentation**: https://www.twilio.com/docs/whatsapp
3. **Console**: https://console.twilio.com/

### Common Resources:
- [Twilio WhatsApp Quickstart](https://www.twilio.com/docs/whatsapp/quickstart)
- [WhatsApp Sandbox Guide](https://www.twilio.com/docs/whatsapp/sandbox)
- [Message Templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)

---

**Happy Messaging! 🎉**
