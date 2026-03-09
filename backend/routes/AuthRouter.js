import { Router } from "express";
import { createAccessToken } from "../controllers/AuthController.js";

const router = Router();

router.post('/register', createAccessToken);
export default router;