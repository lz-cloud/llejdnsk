import { Request, Response } from 'express';
import adminService from '../services/adminService';
import { configurePassport } from '../config/passport';

export const createKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const knowledgeBase = await adminService.createKnowledgeBase(req.body);
    res.status(201).json({ success: true, data: knowledgeBase });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Failed to create knowledge base' });
  }
};

export const updateKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const knowledgeBase = await adminService.updateKnowledgeBase(req.params.id, req.body);
    res.json({ success: true, data: knowledgeBase });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Failed to update knowledge base' });
  }
};

export const listKnowledgeBases = async (_req: Request, res: Response) => {
  try {
    const knowledgeBases = await adminService.listKnowledgeBases();
    res.json({ success: true, data: knowledgeBases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list knowledge bases' });
  }
};

export const getKnowledgeBase = async (req: Request, res: Response) => {
  try {
    const knowledgeBase = await adminService.getKnowledgeBase(req.params.id);
    if (!knowledgeBase) {
      return res.status(404).json({ success: false, message: 'Knowledge base not found' });
    }
    res.json({ success: true, data: knowledgeBase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get knowledge base' });
  }
};

export const deleteKnowledgeBase = async (req: Request, res: Response) => {
  try {
    await adminService.deleteKnowledgeBase(req.params.id);
    res.json({ success: true, message: 'Knowledge base deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete knowledge base' });
  }
};

export const createOrUpdateSSOConfig = async (req: Request, res: Response) => {
  try {
    const ssoConfig = await adminService.createOrUpdateSSOConfig(req.body);
    res.status(req.body.id ? 200 : 201).json({ success: true, data: ssoConfig });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Failed to save SSO config' });
  }
};

export const listSSOConfigs = async (_req: Request, res: Response) => {
  try {
    const configs = await adminService.listSSOConfigs();
    const sanitizedConfigs = configs.map(config => ({
      ...config,
      desKey: config.desKey ? '***' + config.desKey.slice(-2) : undefined,
      desIV: config.desIV ? '***' + config.desIV.slice(-2) : undefined,
    }));
    res.json({ success: true, data: sanitizedConfigs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list SSO configs' });
  }
};

export const getSSOConfig = async (req: Request, res: Response) => {
  try {
    const config = await adminService.getSSOConfig(req.params.id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'SSO config not found' });
    }
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get SSO config' });
  }
};

export const toggleSSOConfig = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }
    const config = await adminService.toggleSSOConfig(req.params.id, isActive);
    res.json({ success: true, data: config, message: `SSO config ${isActive ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to toggle SSO config' });
  }
};

export const deleteSSOConfig = async (req: Request, res: Response) => {
  try {
    await adminService.deleteSSOConfig(req.params.id);
    res.json({ success: true, message: 'SSO config deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete SSO config' });
  }
};

export const createOrUpdateUser = async (req: Request, res: Response) => {
  try {
    const user = await adminService.createOrUpdateUser(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Failed to save user' });
  }
};

export const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await adminService.listUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list users' });
  }
};

export const deactivateUser = async (req: Request, res: Response) => {
  try {
    await adminService.deactivateUser(req.params.id);
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to deactivate user' });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const group = await adminService.createGroup(req.body.name, req.body.description);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create group' });
  }
};

export const listGroups = async (_req: Request, res: Response) => {
  try {
    const groups = await adminService.listGroups();
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list groups' });
  }
};

export const bulkAssignPermissions = async (req: Request, res: Response) => {
  try {
    await adminService.bulkAssignPermissions(req.body);
    res.json({ success: true, message: 'Permissions assigned successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to assign permissions' });
  }
};

export const getAccessAnalytics = async (_req: Request, res: Response) => {
  try {
    const analytics = await adminService.getAccessAnalytics();
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get analytics' });
  }
};

export const getSystemStats = async (_req: Request, res: Response) => {
  try {
    const stats = await adminService.getSystemStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get system stats' });
  }
};

export const bulkImportUsers = async (req: Request, res: Response) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ success: false, message: 'users must be a non-empty array' });
    }

    const normalizedUsers = users.map((user: any) => ({
      ...user,
      groups: Array.isArray(user.groups) ? user.groups : [],
    }));

    const results = await adminService.bulkImportUsers(normalizedUsers);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to import users' });
  }
};

export const bulkUpdateUserGroups = async (req: Request, res: Response) => {
  try {
    const { userIds, groupIds, replace } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'userIds must be a non-empty array' });
    }
    if (!Array.isArray(groupIds) || groupIds.length === 0) {
      return res.status(400).json({ success: false, message: 'groupIds must be a non-empty array' });
    }

    await adminService.bulkUpdateUserGroups({ userIds, groupIds, replace });
    res.json({ success: true, message: 'User groups updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update user groups' });
  }
};

export const exportUsers = async (_req: Request, res: Response) => {
  try {
    const users = await adminService.exportUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to export users' });
  }
};

export const createOrUpdateOAuth2Config = async (req: Request, res: Response) => {
  try {
    const config = await adminService.createOrUpdateOAuth2Config(req.body);
    await configurePassport();
    res.status(req.body.id ? 200 : 201).json({ success: true, data: config });
  } catch (error) {
    res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Failed to save OAuth2 config' });
  }
};

export const listOAuth2Configs = async (_req: Request, res: Response) => {
  try {
    const configs = await adminService.listOAuth2Configs();
    const sanitizedConfigs = configs.map(config => ({
      ...config,
      clientSecret: config.clientSecret ? '***' + config.clientSecret.slice(-4) : undefined,
    }));
    res.json({ success: true, data: sanitizedConfigs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list OAuth2 configs' });
  }
};

export const getOAuth2Config = async (req: Request, res: Response) => {
  try {
    const config = await adminService.getOAuth2Config(req.params.id);
    if (!config) {
      return res.status(404).json({ success: false, message: 'OAuth2 config not found' });
    }
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get OAuth2 config' });
  }
};

export const toggleOAuth2Config = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }
    const config = await adminService.toggleOAuth2Config(req.params.id, isActive);
    await configurePassport();
    res.json({ success: true, data: config, message: `OAuth2 config ${isActive ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to toggle OAuth2 config' });
  }
};

export const deleteOAuth2Config = async (req: Request, res: Response) => {
  try {
    await adminService.deleteOAuth2Config(req.params.id);
    await configurePassport();
    res.json({ success: true, message: 'OAuth2 config deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to delete OAuth2 config' });
  }
};
