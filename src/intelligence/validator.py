# /Users/zakherfrogman/Documents/Conservation evidence/src/intelligence/validator.py

from dotenv import load_dotenv
load_dotenv()

import re
from contracts.evidence import EvidenceSynthesis


def validate_synthesis(result: EvidenceSynthesis,
                       source_chunks: list) -> dict:
    """Validate that a synthesis result has correct citations.

    Checks:
    - orphan_cites: [N] references in text that don't match any source chunk
    - missing_objects: [N] references in text that lack a citation object
    - confidence_ok: "strong" confidence requires at least 2 interventions

    Returns:
        dict with 'valid', 'orphan_cites', 'missing_objects', 'confidence_ok'
    """
    cited_in_text = {
        int(n) for n in re.findall(r'\[(\d+)\]', result.answer)
    }
    citation_objs = {c.index for c in result.citations}
    available     = set(range(1, len(source_chunks) + 1))

    orphan_cites  = cited_in_text - available
    missing_objs  = cited_in_text - citation_objs

    return {
        "valid":           len(orphan_cites) == 0 and len(missing_objs) == 0,
        "orphan_cites":    sorted(orphan_cites),
        "missing_objects": sorted(missing_objs),
        "confidence_ok":   not (
            result.confidence.value == "strong"
            and len(result.interventions) < 2
        )
    }
