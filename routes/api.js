import express from 'express';
import { createUser, getUsers } from '../controller/user-controller.js';
import { addExercise, getLogs } from '../controller/exercise-controller.js';

const router = express.Router();

export const setupRoutes = (db) => {
  router.post('/users', createUser(db));
  router.get('/users', getUsers(db));
  router.post('/users/:_id/exercises', addExercise(db));
  router.get('/users/:_id/logs', getLogs(db));
  
  return router;
};