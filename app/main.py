# /Users/zakherfrogman/Documents/Conservation evidence/app/main.py

from dotenv import load_dotenv
import os
load_dotenv()

import streamlit as st
import requests

# FastAPI backend URL — from .env for flexibility
API_BASE = os.getenv("API_BASE", "http://localhost:8000")

CONFIDENCE_ICONS = {
    "strong":   "🟢 Strong evidence",
    "moderate": "🟡 Moderate evidence",
    "weak":     "🟠 Weak evidence",
    "none":     "🔴 No evidence found"
}

st.set_page_config(
    page_title = "CEIP — Conservation Evidence",
    page_icon  = "🌿",
    layout     = "wide"
)

page = st.sidebar.radio(
    "Navigate",
    ["🔍 Evidence Search", "📋 My Projects", "📊 Species Explorer"]
)

if page == "🔍 Evidence Search":
    st.title("🌿 Conservation Evidence Intelligence")
    st.caption(
        "Ask what conservation interventions work. "
        "Get cited, evidence-based answers updated weekly."
    )

    question = st.text_area(
        "Your conservation question",
        placeholder=(
            "e.g. What works for reducing human-elephant conflict "
            "in East Africa?"
        ),
        height=80
    )
    col1, col2 = st.columns(2)
    species  = col1.text_input("Species or taxon group (optional)")
    location = col2.text_input("Location (optional)")

    if st.button("Search Evidence", type="primary") and question:
        with st.spinner("Synthesising evidence from the literature..."):
            try:
                r = requests.post(
                    f"{API_BASE}/api/v1/evidence",
                    json={"question": question,
                          "species":  species,
                          "location": location},
                    timeout=300
                )
                result = r.json()
            except Exception as e:
                st.error(f"Could not reach the evidence engine: {e}")
                st.stop()

        # Evidence strength
        conf = result.get('confidence', 'none')
        st.info(CONFIDENCE_ICONS.get(conf, conf))

        # Answer
        st.markdown("### Evidence Summary")
        st.write(result.get('answer', ''))

        # CE intervention ratings
        interventions = result.get('interventions', [])
        if interventions:
            st.markdown("### Conservation Evidence Ratings")
            for iv in interventions:
                c1, c2, c3 = st.columns([3, 1, 1])
                c1.write(iv.get('name', ''))
                score = iv.get('effectiveness_pct')
                c2.metric("CE Score", f"{score:.0f}%" if score else "N/A")
                c3.write(iv.get('ce_category') or "—")

        # Evidence gaps
        gaps = result.get('evidence_gaps', [])
        if gaps:
            with st.expander("Evidence Gaps"):
                for gap in gaps:
                    st.write(f"• {gap}")

        # Citations
        citations = result.get('citations', [])
        if citations:
            st.markdown("### Sources")
            for c in citations:
                st.caption(
                    f"[{c['index']}] {c['title']} "
                    f"({c.get('year', '?')})"
                )

        # Feedback
        st.divider()
        f1, f2 = st.columns(2)
        if f1.button("👍 Helpful"):
            requests.post(f"{API_BASE}/api/v1/feedback",
                json={"question": question, "rating": "positive"})
        if f2.button("👎 Not helpful"):
            requests.post(f"{API_BASE}/api/v1/feedback",
                json={"question": question, "rating": "negative"})

elif page == "📋 My Projects":
    st.title("📋 My Conservation Projects")
    st.caption("Register projects to receive alerts when new evidence is published.")
    st.info("Coming soon — project registration and alert management.")

elif page == "📊 Species Explorer":
    st.title("📊 Species Explorer")
    st.caption("Search the IUCN species database for conservation status.")

    name = st.text_input("Search species by name")
    if name:
        try:
            r = requests.get(f"{API_BASE}/api/v1/species/{name}", timeout=10)
            if r.status_code == 200:
                sp = r.json()
                st.success(f"**{sp['name']}** — IUCN: {sp['category']} | Class: {sp['class']}")
            elif r.status_code == 404:
                st.warning("No species found matching that name.")
            else:
                st.error(f"API error: {r.status_code}")
        except Exception as e:
            st.error(f"Could not reach the API: {e}")
