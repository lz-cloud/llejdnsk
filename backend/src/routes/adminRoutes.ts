import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import * as adminController from '../controllers/adminController';

const router = Router();

router.use(authenticate, requireAdmin);

router.route('/knowledge-bases')
  .get(adminController.listKnowledgeBases)
  .post(adminController.createKnowledgeBase);

router.route('/knowledge-bases/:id')
  .get(adminController.getKnowledgeBase)
  .put(adminController.updateKnowledgeBase)
  .delete(adminController.deleteKnowledgeBase);

router.route('/sso-configs')
  .get(adminController.listSSOConfigs)
  .post(adminController.createOrUpdateSSOConfig);

router.route('/sso-configs/:id')
  .delete(adminController.deleteSSOConfig);

router.route('/users')
  .get(adminController.listUsers)
  .post(adminController.createOrUpdateUser);

router.post('/users/:id/deactivate', adminController.deactivateUser);

router.route('/groups')
  .get(adminController.listGroups)
  .post(adminController.createGroup);

router.post('/bulk-permissions', adminController.bulkAssignPermissions);

router.get('/access-analytics', adminController.getAccessAnalytics);
router.get('/system-stats', adminController.getSystemStats);

export default router;
