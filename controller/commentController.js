import prisma from "../DB/db.config.js";

// Create a new comment
export const createComment = (req, res) => {
  const { content, organisateurid, prestataireid } = req.body;

  if (!content || !organisateurid || !prestataireid) {
    return res.status(400).json({ error: 'Content, organisateurid, and prestataireid are required' });
  }

  prisma.comments.create({
    data: {
      content,
      organisateurid,
      prestataireid,
    },
    include: {
      Organisateur: true,
      Prestataire: true,
    },
  })
    .then(comment => {
      res.status(201).json(comment);
    })
    .catch(error => {
      res.status(500).json({ error: `Failed to create comment: ${error.message}` });
    })
    .finally(() => {
      prisma.$disconnect();
    });
};

// Read a comment by ID
export const getCommentById = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Comment ID is required' });
  }

  prisma.comments.findUnique({
    where: { id },
    include: {
      Organisateur: true,
      Prestataire: true,
    },
  })
    .then(comment => {
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      res.status(200).json(comment);
    })
    .catch(error => {
      res.status(500).json({ error: `Failed to retrieve comment: ${error.message}` });
    })
    .finally(() => {
      prisma.$disconnect();
    });
};

// Read all comments
export const getAllComments = (req, res) => {
  prisma.comments.findMany({
    include: {
      Organisateur: true,
      Prestataire: true,
    },
  })
    .then(comments => {
      res.status(200).json(comments);
    })
    .catch(error => {
      res.status(500).json({ error: `Failed to retrieve comments: ${error.message}` });
    })
    .finally(() => {
      prisma.$disconnect();
    });
};

// Update a comment by ID
export const updateComment = (req, res) => {
  const { id } = req.params;
  const { content, organisateurid, prestataireid } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Comment ID is required' });
  }

  prisma.comments.update({
    where: { id },
    data: {
      content,
      organisateurid,
      prestataireid,
    },
    include: {
      Organisateur: true,
      Prestataire: true,
    },
  })
    .then(comment => {
      res.status(200).json(comment);
    })
    .catch(error => {
      res.status(500).json({ error: `Failed to update comment: ${error.message}` });
    })
    .finally(() => {
      prisma.$disconnect();
    });
};

// Delete a comment by ID
export const deleteComment = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Comment ID is required' });
  }

  prisma.comments.delete({
    where: { id },
    include: {
      Organisateur: true,
      Prestataire: true,
    },
  })
    .then(comment => {
      res.status(200).json({ message: 'Comment deleted successfully', comment });
    })
    .catch(error => {
      res.status(500).json({ error: `Failed to delete comment: ${error.message}` });
    })
    .finally(() => {
      prisma.$disconnect();
    });
};