import numpy as np
import logging
from typing import List, Dict, Any, Optional, Tuple
from sentence_transformers import SentenceTransformer
import pickle
import os
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import json

logger = logging.getLogger(__name__)

class EmbeddingsService:
    """
    Comprehensive embeddings service for document and text analysis
    """
    
    def __init__(self):
        self.model_name = "all-MiniLM-L6-v2"  # Lightweight, good performance
        self.model = None
        self.embeddings_cache = {}
        self.document_embeddings = {}
        self.cluster_model = None
        self.pca_model = None
        
        # Initialize model
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the sentence transformer model"""
        try:
            logger.info(f"Loading sentence transformer model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info("Sentence transformer model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load sentence transformer model: {str(e)}")
            self.model = None
    
    async def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of texts
        """
        try:
            if not self.model:
                logger.warning("Model not available, returning empty embeddings")
                return [[0.0] * 384 for _ in texts]  # Default dimension
            
            if not texts:
                return []
            
            # Clean texts
            cleaned_texts = [self._clean_text(text) for text in texts]
            
            # Generate embeddings
            embeddings = self.model.encode(cleaned_texts, convert_to_tensor=False)
            
            # Convert to list of lists
            return embeddings.tolist()
            
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {str(e)}")
            return [[0.0] * 384 for _ in texts]
    
    async def generate_single_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        """
        try:
            embeddings = await self.generate_embeddings([text])
            return embeddings[0] if embeddings else [0.0] * 384
            
        except Exception as e:
            logger.error(f"Failed to generate single embedding: {str(e)}")
            return [0.0] * 384
    
    async def calculate_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate cosine similarity between two texts
        """
        try:
            embeddings = await self.generate_embeddings([text1, text2])
            
            if len(embeddings) != 2:
                return 0.0
            
            # Calculate cosine similarity
            similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Failed to calculate similarity: {str(e)}")
            return 0.0
    
    async def find_similar_documents(
        self, 
        query_text: str, 
        document_texts: List[str], 
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Find most similar documents to a query text
        """
        try:
            if not document_texts:
                return []
            
            # Generate embeddings for query and documents
            all_texts = [query_text] + document_texts
            embeddings = await self.generate_embeddings(all_texts)
            
            if len(embeddings) < 2:
                return []
            
            query_embedding = embeddings[0]
            doc_embeddings = embeddings[1:]
            
            # Calculate similarities
            similarities = cosine_similarity([query_embedding], doc_embeddings)[0]
            
            # Create results with similarity scores
            results = []
            for i, similarity in enumerate(similarities):
                results.append({
                    "document_index": i,
                    "text": document_texts[i][:200] + "..." if len(document_texts[i]) > 200 else document_texts[i],
                    "similarity_score": float(similarity),
                    "text_length": len(document_texts[i])
                })
            
            # Sort by similarity and return top_k
            results.sort(key=lambda x: x["similarity_score"], reverse=True)
            return results[:top_k]
            
        except Exception as e:
            logger.error(f"Failed to find similar documents: {str(e)}")
            return []
    
    async def cluster_documents(
        self, 
        documents: List[str], 
        n_clusters: int = 5
    ) -> Dict[str, Any]:
        """
        Cluster documents based on their embeddings
        """
        try:
            if len(documents) < n_clusters:
                n_clusters = max(1, len(documents) // 2)
            
            # Generate embeddings
            embeddings = await self.generate_embeddings(documents)
            
            if not embeddings:
                return {"error": "Failed to generate embeddings"}
            
            # Perform clustering
            embeddings_array = np.array(embeddings)
            self.cluster_model = KMeans(n_clusters=n_clusters, random_state=42)
            cluster_labels = self.cluster_model.fit_predict(embeddings_array)
            
            # Organize results by cluster
            clusters = {}
            for i, label in enumerate(cluster_labels):
                if label not in clusters:
                    clusters[label] = []
                
                clusters[label].append({
                    "document_index": i,
                    "text": documents[i][:200] + "..." if len(documents[i]) > 200 else documents[i],
                    "cluster_id": int(label)
                })
            
            # Calculate cluster statistics
            cluster_stats = {}
            for cluster_id, cluster_docs in clusters.items():
                cluster_embeddings = [embeddings[doc["document_index"]] for doc in cluster_docs]
                centroid = np.mean(cluster_embeddings, axis=0)
                
                # Calculate intra-cluster similarity
                similarities = []
                for i, emb1 in enumerate(cluster_embeddings):
                    for j, emb2 in enumerate(cluster_embeddings[i+1:], i+1):
                        sim = cosine_similarity([emb1], [emb2])[0][0]
                        similarities.append(sim)
                
                avg_similarity = np.mean(similarities) if similarities else 0.0
                
                cluster_stats[cluster_id] = {
                    "document_count": len(cluster_docs),
                    "average_intra_similarity": float(avg_similarity),
                    "centroid": centroid.tolist()
                }
            
            return {
                "clusters": clusters,
                "cluster_statistics": cluster_stats,
                "total_documents": len(documents),
                "n_clusters": n_clusters,
                "clustering_quality": self._calculate_silhouette_score(embeddings_array, cluster_labels)
            }
            
        except Exception as e:
            logger.error(f"Failed to cluster documents: {str(e)}")
            return {"error": f"Clustering failed: {str(e)}"}
    
    async def generate_document_summary_embedding(self, document: str) -> Dict[str, Any]:
        """
        Generate embedding and summary information for a document
        """
        try:
            # Generate embedding
            embedding = await self.generate_single_embedding(document)
            
            # Extract document features
            features = self._extract_document_features(document)
            
            # Store in cache with document ID
            doc_id = f"doc_{hash(document)}"
            self.document_embeddings[doc_id] = {
                "embedding": embedding,
                "features": features,
                "text_length": len(document),
                "created_at": self._get_current_timestamp()
            }
            
            return {
                "document_id": doc_id,
                "embedding": embedding,
                "features": features,
                "embedding_dimension": len(embedding),
                "text_statistics": {
                    "character_count": len(document),
                    "word_count": len(document.split()),
                    "sentence_count": len([s for s in document.split('.') if s.strip()])
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to generate document summary embedding: {str(e)}")
            return {"error": f"Failed to process document: {str(e)}"}
    
    async def search_document_collection(
        self, 
        query: str, 
        collection_name: str = "default",
        top_k: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search through a collection of stored document embeddings
        """
        try:
            if not self.document_embeddings:
                return []
            
            # Generate query embedding
            query_embedding = await self.generate_single_embedding(query)
            
            # Search through stored embeddings
            results = []
            for doc_id, doc_data in self.document_embeddings.items():
                similarity = cosine_similarity([query_embedding], [doc_data["embedding"]])[0][0]
                
                results.append({
                    "document_id": doc_id,
                    "similarity_score": float(similarity),
                    "features": doc_data["features"],
                    "text_length": doc_data["text_length"],
                    "created_at": doc_data["created_at"]
                })
            
            # Sort by similarity
            results.sort(key=lambda x: x["similarity_score"], reverse=True)
            
            return results[:top_k]
            
        except Exception as e:
            logger.error(f"Failed to search document collection: {str(e)}")
            return []
    
    async def analyze_text_diversity(self, texts: List[str]) -> Dict[str, Any]:
        """
        Analyze the diversity of a collection of texts
        """
        try:
            if len(texts) < 2:
                return {"error": "Need at least 2 texts for diversity analysis"}
            
            # Generate embeddings
            embeddings = await self.generate_embeddings(texts)
            
            if not embeddings:
                return {"error": "Failed to generate embeddings"}
            
            # Calculate all pairwise similarities
            embeddings_array = np.array(embeddings)
            similarity_matrix = cosine_similarity(embeddings_array)
            
            # Extract upper triangle (excluding diagonal)
            n = len(embeddings)
            similarities = []
            for i in range(n):
                for j in range(i+1, n):
                    similarities.append(similarity_matrix[i][j])
            
            # Calculate diversity metrics
            avg_similarity = np.mean(similarities)
            min_similarity = np.min(similarities)
            max_similarity = np.max(similarities)
            std_similarity = np.std(similarities)
            
            # Diversity score (inverse of average similarity)
            diversity_score = 1 - avg_similarity
            
            # Find most similar and most different pairs
            similarities_with_indices = []
            for i in range(n):
                for j in range(i+1, n):
                    similarities_with_indices.append({
                        "text1_index": i,
                        "text2_index": j,
                        "similarity": similarity_matrix[i][j]
                    })
            
            most_similar = max(similarities_with_indices, key=lambda x: x["similarity"])
            most_different = min(similarities_with_indices, key=lambda x: x["similarity"])
            
            return {
                "diversity_metrics": {
                    "diversity_score": float(diversity_score),
                    "average_similarity": float(avg_similarity),
                    "min_similarity": float(min_similarity),
                    "max_similarity": float(max_similarity),
                    "similarity_std": float(std_similarity)
                },
                "text_count": len(texts),
                "most_similar_pair": {
                    "indices": [most_similar["text1_index"], most_similar["text2_index"]],
                    "similarity": float(most_similar["similarity"]),
                    "texts": [
                        texts[most_similar["text1_index"]][:100] + "...",
                        texts[most_similar["text2_index"]][:100] + "..."
                    ]
                },
                "most_different_pair": {
                    "indices": [most_different["text1_index"], most_different["text2_index"]],
                    "similarity": float(most_different["similarity"]),
                    "texts": [
                        texts[most_different["text1_index"]][:100] + "...",
                        texts[most_different["text2_index"]][:100] + "..."
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"Failed to analyze text diversity: {str(e)}")
            return {"error": f"Diversity analysis failed: {str(e)}"}
    
    async def reduce_dimensionality(
        self, 
        texts: List[str], 
        n_components: int = 2
    ) -> Dict[str, Any]:
        """
        Reduce dimensionality of text embeddings for visualization
        """
        try:
            if len(texts) < n_components:
                return {"error": f"Need at least {n_components} texts for {n_components}D reduction"}
            
            # Generate embeddings
            embeddings = await self.generate_embeddings(texts)
            
            if not embeddings:
                return {"error": "Failed to generate embeddings"}
            
            # Apply PCA
            embeddings_array = np.array(embeddings)
            self.pca_model = PCA(n_components=n_components)
            reduced_embeddings = self.pca_model.fit_transform(embeddings_array)
            
            # Calculate explained variance
            explained_variance_ratio = self.pca_model.explained_variance_ratio_
            total_variance_explained = np.sum(explained_variance_ratio)
            
            # Prepare results
            results = []
            for i, (text, reduced_emb) in enumerate(zip(texts, reduced_embeddings)):
                results.append({
                    "text_index": i,
                    "text_preview": text[:100] + "..." if len(text) > 100 else text,
                    "reduced_coordinates": reduced_emb.tolist(),
                    "original_dimension": len(embeddings[i])
                })
            
            return {
                "reduced_embeddings": results,
                "dimensionality_info": {
                    "original_dimension": len(embeddings[0]),
                    "reduced_dimension": n_components,
                    "total_variance_explained": float(total_variance_explained),
                    "explained_variance_ratio": explained_variance_ratio.tolist()
                },
                "visualization_ready": True
            }
            
        except Exception as e:
            logger.error(f"Failed to reduce dimensionality: {str(e)}")
            return {"error": f"Dimensionality reduction failed: {str(e)}"}
    
    def get_embeddings_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about the embeddings service
        """
        try:
            model_info = {
                "model_name": self.model_name,
                "model_loaded": self.model is not None,
                "embedding_dimension": 384  # Default for MiniLM
            }
            
            cache_info = {
                "cached_embeddings": len(self.embeddings_cache),
                "stored_documents": len(self.document_embeddings)
            }
            
            service_info = {
                "cluster_model_trained": self.cluster_model is not None,
                "pca_model_trained": self.pca_model is not None
            }
            
            return {
                "model_info": model_info,
                "cache_info": cache_info,
                "service_info": service_info,
                "service_status": "operational" if self.model else "degraded"
            }
            
        except Exception as e:
            logger.error(f"Failed to get statistics: {str(e)}")
            return {"error": f"Failed to get statistics: {str(e)}"}
    
    # Helper methods
    def _clean_text(self, text: str) -> str:
        """Clean text for embedding generation"""
        if not text:
            return ""
        
        # Basic cleaning
        cleaned = text.strip()
        # Remove excessive whitespace
        cleaned = " ".join(cleaned.split())
        
        return cleaned
    
    def _extract_document_features(self, document: str) -> Dict[str, Any]:
        """Extract basic features from document"""
        return {
            "word_count": len(document.split()),
            "character_count": len(document),
            "sentence_count": len([s for s in document.split('.') if s.strip()]),
            "avg_word_length": np.mean([len(word) for word in document.split()]) if document.split() else 0,
            "has_numbers": any(char.isdigit() for char in document),
            "has_special_chars": any(not char.isalnum() and not char.isspace() for char in document)
        }
    
    def _calculate_silhouette_score(self, embeddings: np.ndarray, labels: np.ndarray) -> float:
        """Calculate silhouette score for clustering quality"""
        try:
            from sklearn.metrics import silhouette_score
            if len(set(labels)) > 1:
                return float(silhouette_score(embeddings, labels))
            return 0.0
        except Exception:
            return 0.0
    
    def _get_current_timestamp(self) -> str:
        """Get current timestamp as string"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    async def save_embeddings_cache(self, filepath: str) -> bool:
        """Save embeddings cache to file"""
        try:
            cache_data = {
                "embeddings_cache": self.embeddings_cache,
                "document_embeddings": self.document_embeddings
            }
            
            with open(filepath, 'wb') as f:
                pickle.dump(cache_data, f)
            
            logger.info(f"Embeddings cache saved to {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save embeddings cache: {str(e)}")
            return False
    
    async def load_embeddings_cache(self, filepath: str) -> bool:
        """Load embeddings cache from file"""
        try:
            if not os.path.exists(filepath):
                logger.warning(f"Cache file not found: {filepath}")
                return False
            
            with open(filepath, 'rb') as f:
                cache_data = pickle.load(f)
            
            self.embeddings_cache = cache_data.get("embeddings_cache", {})
            self.document_embeddings = cache_data.get("document_embeddings", {})
            
            logger.info(f"Embeddings cache loaded from {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load embeddings cache: {str(e)}")
            return False