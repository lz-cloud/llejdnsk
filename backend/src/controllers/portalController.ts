import { Request, Response } from 'express';
import portalService from '../services/portalService';

export const getKnowledgeBases = async (req: Request, res: Response) => {
  try {
    if (!req.user || 'token' in req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const knowledgeBases = await portalService.getUserKnowledgeBases(req.user.id);
    res.json({ success: true, data: knowledgeBases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch knowledge bases' });
  }
};

export const recordAccess = async (req: Request, res: Response) => {
  try {
    if (!req.user || 'token' in req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { id } = req.params;
    await portalService.recordAccess(req.user.id, id, req.ip, req.headers['user-agent']);
    res.json({ success: true, message: 'Access recorded successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to record access' });
  }
};

export const getRecentAccess = async (req: Request, res: Response) => {
  try {
    if (!req.user || 'token' in req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const recentAccess = await portalService.getRecentAccess(req.user.id);
    res.json({ success: true, data: recentAccess });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recent access' });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  try {
    if (!req.user || 'token' in req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { knowledgeBaseId } = req.body;
    const result = await portalService.toggleFavorite(req.user.id, knowledgeBaseId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update favorite' });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
  try {
    if (!req.user || 'token' in req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const favorites = await portalService.getFavorites(req.user.id);
    res.json({ success: true, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch favorites' });
  }
};

export const getUsageStats = async (req: Request, res: Response) => {
  try {
    if (!req.user || 'token' in req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const stats = await portalService.getUsageStats(req.user.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch usage stats' });
  }
};
