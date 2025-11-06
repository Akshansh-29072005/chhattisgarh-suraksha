import Forum from '../models/forum.js';

export const getAllTopics = async (req, res, next) => {
  try {
    const topics = await Forum.getAllTopics(req.query);
    res.json({
      success: true,
      data: { topics }
    });
  } catch (error) {
    next(error);
  }
};

export const getTopicById = async (req, res, next) => {
  try {
    const topic = await Forum.getTopicById(req.params.id);
    res.json({
      success: true,
      data: { topic }
    });
  } catch (error) {
    next(error);
  }
};

export const createTopic = async (req, res, next) => {
  try {
    const newTopic = await Forum.createTopic({
      ...req.body,
      authorId: req.user.id
    });
    res.status(201).json({
      success: true,
      data: { topic: newTopic }
    });
  } catch (error) {
    next(error);
  }
};

export const updateTopic = async (req, res, next) => {
  try {
    const updatedTopic = await Forum.updateTopic(req.params.id, req.body);
    res.json({
      success: true,
      data: { topic: updatedTopic }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTopic = async (req, res, next) => {
  try {
    await Forum.deleteTopic(req.params.id);
    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const addReply = async (req, res, next) => {
  try {
    const reply = await Forum.addReply({
      topicId: req.params.id,
      authorId: req.user.id,
      content: req.body.content
    });
    res.status(201).json({
      success: true,
      data: { reply }
    });
  } catch (error) {
    next(error);
  }
};

export const getReplies = async (req, res, next) => {
  try {
    const replies = await Forum.getReplies(req.params.id);
    res.json({
      success: true,
      data: { replies }
    });
  } catch (error) {
    next(error);
  }
};

export const voteTopic = async (req, res, next) => {
  try {
    const vote = await Forum.recordVote({
      topicId: req.params.id,
      userId: req.user.id,
      voteType: req.body.type
    });
    res.json({
      success: true,
      data: { vote }
    });
  } catch (error) {
    next(error);
  }
};

export const getForumStats = async (req, res, next) => {
  try {
    const stats = await Forum.getForumStats();
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    next(error);
  }
};

export const getTopContributors = async (req, res, next) => {
  try {
    const contributors = await Forum.getTopContributors();
    res.json({
      success: true,
      data: { contributors }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserOnlineStatus = async (req, res, next) => {
  try {
    const status = await Forum.updateUserOnlineStatus(
      req.user.id,
      req.user.full_name
    );
    res.json({
      success: true,
      data: { status }
    });
  } catch (error) {
    next(error);
  }
};