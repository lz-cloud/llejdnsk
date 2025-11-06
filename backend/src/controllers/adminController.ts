import { Request, Response } from 'express';
import adminService from '../services/adminService';

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
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list SSO configs' });
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
