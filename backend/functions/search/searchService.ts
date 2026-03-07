import express from 'express';
import { Client as OpenSearchClient } from '@opensearch-project/opensearch';
import dotenv from 'dotenv';
import { authenticateToken, AuthenticatedRequest } from '../../middleware/auth';

dotenv.config();

const router = express.Router();

// OpenSearch client configuration
const openSearchClient = new OpenSearchClient({
  node: process.env.OPENSEARCH_ENDPOINT || 'https://localhost:9200',
  auth: {
    username: process.env.OPENSEARCH_USERNAME || 'admin',
    password: process.env.OPENSEARCH_PASSWORD || 'admin'
  },
  ssl: {
    rejectUnauthorized: false // Set to true in production with valid certificates
  }
});

const indexName = process.env.OPENSEARCH_INDEX || 'user-data-vectors';

// Initialize OpenSearch index
const initializeOpenSearchIndex = async () => {
  try {
    const indexExists = await openSearchClient.indices.exists({ index: indexName });
    
    if (!indexExists) {
      await openSearchClient.indices.create({
        index: indexName,
        body: {
          settings: {
            index: {
              knn: true,
              'knn.algo_param.ef_search': 512
            }
          },
          mappings: {
            properties: {
              user_id: { type: 'keyword' },
              data_type: { type: 'keyword' },
              text: { type: 'text' },
              embedding: {
                type: 'knn_vector',
                dimension: parseInt(process.env.EMBEDDING_DIMENSION || '1536'),
                method: {
                  name: 'hnsw',
                  space_type: 'cosinesimil',
                  engine: 'nmslib',
                  parameters: {
                    ef_construction: 512,
                    m: 16
                  }
                }
              },
              created_at: { type: 'date' },
              metadata: { type: 'object' }
            }
          }
        }
      });
      console.log('OpenSearch index created successfully');
    }
  } catch (error) {
    console.error('Error initializing OpenSearch index:', error);
  }
};

initializeOpenSearchIndex();

// Generate embeddings (placeholder - replace with actual embedding service)
const generateEmbedding = async (text: string): Promise<number[]> => {
  // This is a placeholder implementation
  // In production, you would use a service like OpenAI's text-embedding-ada-002
  // or AWS Titan embeddings
  
  // For now, return a mock embedding of the correct dimension
  const dimension = parseInt(process.env.EMBEDDING_DIMENSION || '1536');
  const embedding = new Array(dimension).fill(0).map(() => Math.random() - 0.5);
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
};

// POST /search/store
router.post('/store', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { text, data_type, metadata } = req.body;
    const userId = req.user!.userId;

    // Input validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    if (!data_type) {
      return res.status(400).json({ error: 'data_type is required' });
    }

    // Generate embedding
    const embedding = await generateEmbedding(text);

    // Store in OpenSearch
    const document = {
      user_id: userId,
      data_type,
      text,
      embedding,
      created_at: new Date().toISOString(),
      metadata: metadata || {}
    };

    const response = await openSearchClient.index({
      index: indexName,
      body: document,
      refresh: true
    });

    res.status(201).json({
      message: 'Data stored successfully in OpenSearch',
      document_id: response.body._id,
      user_id: userId,
      data_type
    });

  } catch (error) {
    console.error('Store data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /search/query
router.post('/query', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { query_text, data_type, size = 10, min_score = 0.5 } = req.body;
    const userId = req.user!.userId;

    // Input validation
    if (!query_text || typeof query_text !== 'string') {
      return res.status(400).json({ error: 'query_text is required and must be a string' });
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query_text);

    // Build OpenSearch query
    const searchBody: any = {
      query: {
        bool: {
          must: [
            { term: { user_id: userId } }
          ],
          should: [
            {
              knn: {
                embedding: {
                  vector: queryEmbedding,
                  k: parseInt(size.toString())
                }
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      size: parseInt(size.toString()),
      min_score: parseFloat(min_score.toString())
    };

    // Add data_type filter if specified
    if (data_type) {
      searchBody.query.bool.filter = [{ term: { data_type } }];
    }

    // Execute search
    const response = await openSearchClient.search({
      index: indexName,
      body: searchBody
    });

    const hits = response.body.hits.hits.map((hit: any) => ({
      document_id: hit._id,
      score: hit._score,
      user_id: hit._source.user_id,
      data_type: hit._source.data_type,
      text: hit._source.text,
      created_at: hit._source.created_at,
      metadata: hit._source.metadata
    }));

    res.json({
      query: query_text,
      results: hits,
      total: typeof response.body.hits.total === 'number' 
        ? response.body.hits.total 
        : (response.body.hits.total?.value || 0)
    });

  } catch (error) {
    console.error('Search query error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /search/user/:userId
router.get('/user/:userId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user!.userId;
    const { data_type, size = 50, from = 0 } = req.query;

    // Users can only access their own data
    const userIdNum = Array.isArray(userId) ? parseInt(userId[0]) : parseInt(userId);
    if (userIdNum !== currentUserId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build search query
    const searchBody: any = {
      query: {
        bool: {
          must: [{ term: { user_id: userIdNum } }]
        }
      },
      size: parseInt(size.toString()),
      from: parseInt(from.toString()),
      sort: [{ created_at: { order: 'desc' } }]
    };

    // Add data_type filter if specified
    if (data_type) {
      searchBody.query.bool.filter = [{ term: { data_type } }];
    }

    // Execute search
    const response = await openSearchClient.search({
      index: indexName,
      body: searchBody
    });

    const hits = response.body.hits.hits.map((hit: any) => ({
      document_id: hit._id,
      user_id: hit._source.user_id,
      data_type: hit._source.data_type,
      text: hit._source.text,
      created_at: hit._source.created_at,
      metadata: hit._source.metadata
    }));

    res.json({
      user_id: userIdNum,
      documents: hits,
      total: typeof response.body.hits.total === 'number' 
        ? response.body.hits.total 
        : (response.body.hits.total?.value || 0)
    });

  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /search/document/:documentId
router.delete('/document/:documentId', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user!.userId;
    const docId = Array.isArray(documentId) ? documentId[0] : documentId;

    // First check if the document belongs to the user
    const getResponse = await openSearchClient.get({
      index: indexName,
      id: docId
    });

    if (getResponse.body._source?.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete the document
    await openSearchClient.delete({
      index: indexName,
      id: docId
    });

    res.json({
      message: 'Document deleted successfully',
      document_id: docId
    });

  } catch (error: any) {
    console.error('Delete document error:', error);
    if (error.statusCode === 404) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /search/health
router.get('/health', async (req, res) => {
  try {
    const health = await openSearchClient.cluster.health();
    res.json({
      status: 'healthy',
      opensearch_status: health.body.status,
      cluster_name: health.body.cluster_name
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'unhealthy',
      error: 'OpenSearch connection failed' 
    });
  }
});

export default router;
