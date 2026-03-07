import express from 'express';
import cors from 'cors';
import { handler as chatHandler } from './functions/chat/chatHandler';
import { adminFlaggedHandler, adminReviewHandler } from './functions/admin/adminHandler';
import { locatorHandler } from './functions/locator/locatorHandler';
import { handler as schemeHandler } from './functions/scheme/handler';
import { handler as complaintHandler } from './functions/complaint/handler';
import authRoutes from './functions/auth/authService';
import userDataRoutes from './functions/user_data/userDataService';
import searchRoutes from './functions/search/searchService';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Helper to handle Lambda-style responses or direct objects
const handleResponse = (res: any, result: any) => {
    if (result.statusCode) {
        // Lambda style (mostly for chat)
        let body = result.body;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch (e) { }
        }
        res.status(result.statusCode).set(result.headers || {}).json(body);
    } else {
        // Standard style { success, data, error }
        res.json(result);
    }
};

// Authentication routes
app.use('/auth', authRoutes);

// User data routes
app.use('/user-data', userDataRoutes);

// Search routes
app.use('/search', searchRoutes);

// Existing routes
app.post('/chat', async (req: express.Request, res: express.Response) => {
    const result = await chatHandler({ body: req.body });
    handleResponse(res, result);
});

// Admin dashboard uses POST to fetch flagged items in the mock-inspired frontend code
app.post('/admin/flagged', async (req: express.Request, res: express.Response) => {
    const result = await adminFlaggedHandler();
    handleResponse(res, result);
});

app.get('/admin/flagged', async (req: express.Request, res: express.Response) => {
    const result = await adminFlaggedHandler();
    handleResponse(res, result);
});

app.post('/admin/review', async (req: express.Request, res: express.Response) => {
    const result = await adminReviewHandler(req.body);
    handleResponse(res, result);
});

app.post('/locate', async (req: express.Request, res: express.Response) => {
    const result = await locatorHandler(req.body);
    handleResponse(res, result);
});

app.post('/schemes', async (req: express.Request, res: express.Response) => {
    const result = await schemeHandler({ body: req.body });
    handleResponse(res, result);
});

app.post('/complaint', async (req: express.Request, res: express.Response) => {
    const result = await complaintHandler({ body: req.body });
    handleResponse(res, result);
});

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Available endpoints:`);
    console.log(`  - Authentication: /auth/*`);
    console.log(`  - User Data: /user-data/*`);
    console.log(`  - Search: /search/*`);
    console.log(`  - Chat: /chat`);
    console.log(`  - Admin: /admin/*`);
    console.log(`  - Locator: /locate`);
    console.log(`  - Schemes: /schemes`);
    console.log(`  - Complaint: /complaint`);
    console.log(`  - Health: /health`);
});
