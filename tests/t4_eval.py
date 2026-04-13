# /Users/zakherfrogman/Documents/Conservation evidence/tests/t4_eval.py

from dotenv import load_dotenv
load_dotenv()

import json, time
from src.intelligence.query_handler import handle_query
from loguru import logger

EVAL_PATH = "eval/gold_dataset.json"


def keyword_overlap(expected: str, generated: str) -> bool:
    """Check if key terms from expected intervention appear in generated text."""
    expected_words = set(expected.lower().split()) - {
        "or", "to", "the", "a", "an", "and", "of", "in", "for", "from",
        "on", "into", "with", "use", "that", "is", "are", "be",
    }
    generated_lower = generated.lower()
    matches = sum(1 for w in expected_words if w in generated_lower)
    return matches >= len(expected_words) * 0.4  # 40% keyword overlap


def run_eval():
    gold = json.load(open(EVAL_PATH))
    total = len(gold)
    scores = {
        "ce_present":         0,
        "direction_correct":  0,
        "has_citations":      0,
        "confidence_nonzero": 0,
    }

    results_log = []
    start_all = time.time()

    for i, item in enumerate(gold):
        qstart = time.time()
        logger.info(f"[{i+1}/{total}] {item['question'][:60]}...")

        result = handle_query(
            item["question"],
            species  = item.get("species_group", ""),
            location = item.get("geography", "")
        )

        elapsed = time.time() - qstart

        # Score: CE intervention present (fuzzy match)
        all_interventions = " ".join(iv.name for iv in result.interventions).lower()
        all_text = all_interventions + " " + result.answer.lower()
        ce_match = keyword_overlap(item["expected_intervention"], all_text)
        scores["ce_present"] += ce_match

        # Score: outcome direction correct
        dir_match = False
        if result.interventions:
            dir_match = (
                result.interventions[0].outcome_direction
                == item["expected_direction"]
            )
            scores["direction_correct"] += dir_match

        # Score: has citations
        has_cites = len(result.citations) > 0
        scores["has_citations"] += has_cites

        # Score: confidence is not "none"
        conf_ok = result.confidence.value != "none"
        scores["confidence_nonzero"] += conf_ok

        status = "PASS" if (ce_match and has_cites) else "FAIL"
        logger.info(
            f"  [{status}] CE={ce_match} dir={dir_match} "
            f"cites={len(result.citations)} conf={result.confidence.value} "
            f"({elapsed:.0f}s)"
        )

        results_log.append({
            "id": item["id"],
            "ce_match": ce_match,
            "dir_match": dir_match,
            "has_cites": has_cites,
            "confidence": result.confidence.value,
            "n_interventions": len(result.interventions),
            "elapsed_s": round(elapsed, 1),
        })

    total_time = time.time() - start_all

    print(f"\n{'='*50}")
    print(f"  EVAL RESULTS ({total} questions, {total_time:.0f}s total)")
    print(f"{'='*50}")
    for k, v in scores.items():
        pct = v * 100 // total
        threshold = 70
        status = "PASS" if pct >= threshold else "FAIL"
        print(f"  [{status}] {k}: {v}/{total} ({pct}%)")

    print(f"\n  Avg time per query: {total_time / total:.0f}s")
    print(f"\n  Save results in CLAUDE.md.")
    print(f"  CE accuracy must beat Phase 1 SQL baseline (5/5).")

    # Save detailed results
    with open("eval/eval_results.json", "w") as f:
        json.dump(results_log, f, indent=2)
    print(f"  Detailed results saved to eval/eval_results.json")


if __name__ == "__main__":
    run_eval()
