import { pipeline } from "@huggingface/transformers";

const MODEL = "Xenova/distilbert-base-uncased-finetuned-sst-2-english";
const examples = [
  { id: "positive", expectedSentiment: "POSITIVE", text: "The replacement arrived quickly and the seller kept me updated. Thank you!" },
  { id: "negative", expectedSentiment: "NEGATIVE", text: "My order is late again and nobody has replied to my messages." },
  { id: "neutral_question", expectedSentiment: "NEUTRAL", text: "Can you confirm whether this item is available in size M?" },
];

const classify = await pipeline("text-classification", MODEL);
for (const example of examples) {
  const [result] = await classify(example.text, { top_k: 1 });
  const confidence = Number(result.score);
  const label = confidence < 0.65 ? "UNCERTAIN" : String(result.label).toUpperCase();
  process.stdout.write(JSON.stringify({
    id: example.id,
    expectedSentiment: example.expectedSentiment,
    sentiment: label,
    matchesExampleLabel: label === example.expectedSentiment,
    confidence: Number(confidence.toFixed(4)),
    model: MODEL,
    policyEffect: "signal_only",
  }) + "\n");
}
process.stdout.write("Demo only: this English SST-2 model is a sentiment baseline, not a calibrated support classifier. It never grants permission to auto-reply.\n");