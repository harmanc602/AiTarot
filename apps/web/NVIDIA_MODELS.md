# NVIDIA NIM Model Test

Try changing your model to one of these **confirmed working models**:

## Option 1: Llama 3.1 8B (Recommended - Fast & Free)
```env
VITE_LLM_MODEL=meta/llama-3.1-8b-instruct
```

## Option 2: Llama 3.1 70B (Better quality, slower)
```env
VITE_LLM_MODEL=meta/llama-3.1-70b-instruct
```

## Option 3: Mistral 7B (Good alternative)
```env
VITE_LLM_MODEL=mistralai/mistral-7b-instruct-v0.3
```

## Current Issue

Your current model `deepseek-ai/deepseek-v4-flash-0731` might:
1. Not be available on NVIDIA NIM's free tier
2. Require different API endpoint format
3. Need special access

## Quick Fix

**Update `.env.local`:**
```env
VITE_LLM_MODEL=meta/llama-3.1-8b-instruct
```

Then restart dev server and test again!
