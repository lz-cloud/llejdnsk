import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as portalController from '../controllers/portalController';

const router = Router();

router.use(authenticate);

router.get('/knowledge-bases', portalController.getKnowledgeBases);
router.post('/knowledge-bases/:id/access', portalController.recordAccess);
router.get('/recent-access', portalController.getRecentAccess);
router.post('/favorites', portalController.toggleFavorite);
router.get('/favorites', portalController.getFavorites);
router.get('/usage-stats', portalController.getUsageStats);

export default router;
