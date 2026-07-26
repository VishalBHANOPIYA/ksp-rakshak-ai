import re
import math
from typing import List, Dict, Any

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False


class FallbackTfidfVectorizer:
    def __init__(self):
        self.idf = {}

    def _tokenize(self, text: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z0-9]+\b', text.lower())
        stop_words = {'in', 'the', 'a', 'an', 'and', 'or', 'of', 'to', 'for', 'is', 'on', 'at', 'by', 'with'}
        return [w for w in words if w not in stop_words and len(w) > 1]

    def fit_transform(self, raw_documents: List[str]):
        N = len(raw_documents)
        doc_tokens = [self._tokenize(doc) for doc in raw_documents]
        df = {}
        for tokens in doc_tokens:
            for word in set(tokens):
                df[word] = df.get(word, 0) + 1
        self.idf = {w: math.log((1 + N) / (1 + count)) + 1 for w, count in df.items()}
        vectors = []
        for tokens in doc_tokens:
            vec = {}
            tot = len(tokens) or 1
            for w in set(tokens):
                vec[w] = (tokens.count(w) / tot) * self.idf[w]
            vectors.append(vec)
        return vectors

    def transform(self, raw_documents: List[str]):
        tokens = self._tokenize(raw_documents[0])
        tot = len(tokens) or 1
        vec = {}
        for w in set(tokens):
            vec[w] = (tokens.count(w) / tot) * self.idf.get(w, 1.0)
        return vec


def fallback_cosine_similarity(q_vec: dict, doc_vecs: list) -> list:
    qn = math.sqrt(sum(v * v for v in q_vec.values())) or 1.0
    scores = []
    for d in doc_vecs:
        dot = sum(q_vec.get(w, 0) * val for w, val in d.items())
        dn = math.sqrt(sum(v * v for v in d.values())) or 1.0
        scores.append(dot / (qn * dn))
    return scores


class VectorSearchEngine:
    def __init__(self):
        self.documents = [] # List of dicts with doc_id, text, metadata
        self.vectorizer = None
        self.doc_vectors = None

    def build_vector_index(self, firs_data: List[Dict[str, Any]]):
        """Indexes free-text FIR narratives, Modus Operandi (MO), and Spot Mahazar notes."""
        self.documents = []
        for fir in firs_data:
            combined_text = f"FIR: {fir['fir_no']}. Crime Head: {fir['crime_head']}. MO Narrative: {fir['mo_narrative']} Spot Mahazar: {fir.get('spot_mahazar', '')}"
            self.documents.append({
                "id": fir["id"],
                "fir_no": fir["fir_no"],
                "station_id": fir["station_id"],
                "crime_head": fir["crime_head"],
                "bns_sections": fir["bns_sections"],
                "text": combined_text,
                "mo_narrative": fir["mo_narrative"]
            })

        if not self.documents:
            return

        corpus = [doc["text"] for doc in self.documents]
        if HAS_SKLEARN:
            self.vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
            self.doc_vectors = self.vectorizer.fit_transform(corpus)
        else:
            self.vectorizer = FallbackTfidfVectorizer()
            self.doc_vectors = self.vectorizer.fit_transform(corpus)
        
        print(f"[VECTOR] Vector Search Engine indexed {len(self.documents)} FIR narrative documents.")

    def search_similar_cases(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Executes similarity search across indexed FIR narratives."""
        if self.vectorizer is None or self.doc_vectors is None:
            return []

        if HAS_SKLEARN:
            query_vec = self.vectorizer.transform([query])
            similarities = cosine_similarity(query_vec, self.doc_vectors)[0]
            top_indices = similarities.argsort()[::-1][:top_k]
            results = []
            for idx in top_indices:
                score = float(similarities[idx])
                if score > 0.05:
                    doc = self.documents[idx]
                    results.append({
                        "fir_id": doc["id"],
                        "fir_no": doc["fir_no"],
                        "crime_head": doc["crime_head"],
                        "bns_sections": doc["bns_sections"],
                        "mo_narrative": doc["mo_narrative"],
                        "score": round(score, 4)
                    })
            return results
        else:
            query_vec = self.vectorizer.transform([query])
            similarities = fallback_cosine_similarity(query_vec, self.doc_vectors)
            indexed_scores = sorted(enumerate(similarities), key=lambda x: x[1], reverse=True)[:top_k]
            results = []
            for idx, score in indexed_scores:
                if score > 0.05:
                    doc = self.documents[idx]
                    results.append({
                        "fir_id": doc["id"],
                        "fir_no": doc["fir_no"],
                        "crime_head": doc["crime_head"],
                        "bns_sections": doc["bns_sections"],
                        "mo_narrative": doc["mo_narrative"],
                        "score": round(score, 4)
                    })
            return results


# Global Instance
vector_engine = VectorSearchEngine()
