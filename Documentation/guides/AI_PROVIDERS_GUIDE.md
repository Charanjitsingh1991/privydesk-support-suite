# 🤖 AI Providers Configuration Guide

PRIVYDESK supports multiple AI providers for ticket analysis. Choose based on your needs:

---

## 🚀 Recommended: Groq (Free & Fast)

**Best for:** Getting started, high volume, low cost

### Features
- ✅ **FREE** tier with generous limits
- ✅ **Extremely fast** inference (< 1 second)
- ✅ Llama 3.3 70B model
- ✅ No credit card required to start

### Setup

1. **Get API Key:**
   - Go to: https://console.groq.com/keys
   - Sign up (free)
   - Create new API key

2. **Set Secrets in Supabase:**
   ```bash
   npx supabase secrets set AI_PROVIDER=groq
   npx supabase secrets set GROQ_API_KEY=your-groq-api-key
   ```

3. **Free Tier Limits:**
   - 30 requests/minute
   - 14,400 requests/day
   - More than enough for most use cases

---

## 💎 OpenRouter (Flexible & Cost-Effective)

**Best for:** Access to multiple models, pay-as-you-go

### Features
- ✅ Access to **100+ models** (Claude, GPT-4, Llama, Gemini, etc.)
- ✅ **Very affordable** pricing
- ✅ Switch models without code changes
- ✅ Only pay for what you use

### Setup

1. **Get API Key:**
   - Go to: https://openrouter.ai/keys
   - Sign up and add credits ($5 minimum)
   - Create API key

2. **Set Secrets in Supabase:**
   ```bash
   npx supabase secrets set AI_PROVIDER=openrouter
   npx supabase secrets set OPENROUTER_API_KEY=your-openrouter-api-key
   ```

3. **Recommended Models:**
   - `meta-llama/llama-3.1-70b-instruct` (default, $0.18/1M tokens)
   - `anthropic/claude-3.5-sonnet` (best quality, $3/1M tokens)
   - `google/gemini-pro-1.5` (balanced, $0.50/1M tokens)

4. **Change Model:**
   Edit `supabase/functions/analyze-ticket/index.ts` line 68:
   ```typescript
   model = "anthropic/claude-3.5-sonnet"; // or any other model
   ```

---

## 🔵 OpenAI (Most Reliable)

**Best for:** Enterprise, maximum reliability

### Features
- ✅ Industry standard
- ✅ Excellent documentation
- ✅ GPT-4o-mini (fast & affordable)
- ✅ Best for production

### Setup

1. **Get API Key:**
   - Go to: https://platform.openai.com/api-keys
   - Sign up and add payment method
   - Create API key

2. **Set Secrets in Supabase:**
   ```bash
   npx supabase secrets set AI_PROVIDER=openai
   npx supabase secrets set OPENAI_API_KEY=your-openai-api-key
   ```

3. **Pricing:**
   - GPT-4o-mini: $0.15/1M input tokens, $0.60/1M output tokens
   - GPT-4o: $2.50/1M input tokens, $10/1M output tokens

---

## 📊 Cost Comparison

For 1,000 ticket analyses (avg 500 tokens each):

| Provider | Model | Cost | Speed |
|----------|-------|------|-------|
| **Groq** | Llama 3.3 70B | **FREE** | ⚡ Fastest |
| **OpenRouter** | Llama 3.1 70B | ~$0.09 | 🚀 Fast |
| **OpenRouter** | Claude 3.5 Sonnet | ~$1.50 | 🏃 Medium |
| **OpenAI** | GPT-4o-mini | ~$0.38 | 🏃 Medium |
| **OpenAI** | GPT-4o | ~$6.25 | 🐢 Slower |

---

## 🎯 Our Recommendation

### For Development & Testing
**Use Groq** - It's free, fast, and perfect for development.

```bash
npx supabase secrets set AI_PROVIDER=groq
npx supabase secrets set GROQ_API_KEY=your-groq-api-key
```

### For Production (Small-Medium)
**Use OpenRouter with Llama 3.1** - Excellent quality at minimal cost.

```bash
npx supabase secrets set AI_PROVIDER=openrouter
npx supabase secrets set OPENROUTER_API_KEY=your-openrouter-api-key
```

### For Production (Enterprise)
**Use OpenAI GPT-4o-mini** - Maximum reliability and support.

```bash
npx supabase secrets set AI_PROVIDER=openai
npx supabase secrets set OPENAI_API_KEY=your-openai-api-key
```

---

## 🔧 Configuration

### Current Configuration
Check which provider is active:
```bash
npx supabase secrets list
```

### Switch Providers
Simply change the `AI_PROVIDER` secret:
```bash
# Switch to Groq
npx supabase secrets set AI_PROVIDER=groq

# Switch to OpenRouter
npx supabase secrets set AI_PROVIDER=openrouter

# Switch to OpenAI
npx supabase secrets set AI_PROVIDER=openai
```

No code changes or redeployment needed!

---

## 🧪 Testing AI Analysis

Test the analyze-ticket function:

```bash
curl -X POST https://mgnuddfytlbtgprckzto.supabase.co/functions/v1/analyze-ticket \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "categorize",
    "subject": "Cannot login to my account",
    "description": "I keep getting an error when trying to log in. It says invalid credentials but I am sure my password is correct."
  }'
```

---

## 📈 Monitoring Usage

### Groq
- Dashboard: https://console.groq.com/usage
- View requests, tokens, and rate limits

### OpenRouter
- Dashboard: https://openrouter.ai/activity
- Track spending and model usage

### OpenAI
- Dashboard: https://platform.openai.com/usage
- Detailed usage and billing

---

## 🛡️ Best Practices

1. **Start with Groq** - Test everything for free
2. **Monitor costs** - Set up billing alerts
3. **Use caching** - PRIVYDESK caches AI results to reduce API calls
4. **Rate limiting** - Built-in rate limiting prevents abuse
5. **Fallback** - Consider setting up multiple providers for redundancy

---

## 🔐 Security Notes

- ✅ API keys are stored securely in Supabase secrets
- ✅ Never exposed to client-side code
- ✅ Only Edge Functions can access them
- ✅ Rotate keys regularly for security

---

## 🆘 Troubleshooting

### "API key not configured" error
- Verify secret is set: `npx supabase secrets list`
- Check secret name matches provider
- Redeploy function after setting secrets

### "Rate limit exceeded"
- Groq: Wait 1 minute or upgrade plan
- OpenRouter: Add more credits
- OpenAI: Check usage limits in dashboard

### "Invalid API key"
- Verify key is correct and active
- Check for extra spaces or characters
- Regenerate key if needed

---

## 📚 Additional Resources

- **Groq Docs:** https://console.groq.com/docs
- **OpenRouter Docs:** https://openrouter.ai/docs
- **OpenAI Docs:** https://platform.openai.com/docs

---

**Last Updated:** January 2025
