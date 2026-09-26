# English transformer sentiment baseline

## Demo

Run npm run sentiment:demo. The script uses Transformers.js and the ONNX-capable English DistilBERT SST-2 checkpoint Xenova/distilbert-base-uncased-finetuned-sst-2-english. On first run, the model is downloaded from Hugging Face and cached locally. Inference runs locally; no buyer text is sent to OpenAI or a remote inference endpoint.

The upstream model is a binary positive/negative classifier fine-tuned on SST-2 movie reviews and is published under Apache-2.0. [Hugging Face model card](https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english) · [Transformers.js Node inference guide](https://huggingface.co/docs/transformers.js/en/tutorials/node)

The example maps scores below 0.65 to UNCERTAIN. This is a conservative display threshold, not calibrated confidence. The binary model cannot learn a neutral label; uncertain means it should not be treated as a polarity prediction.

## Safety and cost boundary

Sentiment is an optional local signal for queue ordering and explanation. It does not determine risk, intent, urgency, evidence quality, or allowed action. A negative tone alone must not cause escalation; a positive tone must never clear payment, cancellation, safety, privacy, complaint, or other hard-risk signals. Sentiment cannot make a draft eligible for automatic reply.

The sample is not currently on the Next.js request path. It avoids OpenAI API cost and avoids a large model download/cold start on Vercel. Do not load this model per serverless invocation. If sentiment is adopted in the app, run it in a persistent/batched worker or offline enrichment path and store model ID, model revision, label, score, and timestamp.

## Limits and validation

SST-2 is a movie-review dataset, not marketplace support data. In the demo, the neutral size-availability question received a high-confidence negative prediction, demonstrating that the model can be confidently wrong on short support messages. English wording, sarcasm, mixed feelings, short questions, and non-native language can shift errors. Before operational use, evaluate against a human-labeled seller-support set. Measure class precision/recall and calibration by intent; let a seller correct labels. Use the future English SaaS dataset only under its approved data-use terms. Never infer protected traits or use sentiment to penalize a buyer.