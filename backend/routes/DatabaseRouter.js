import { Router } from "express";
import {text_to_isl_store, isl_to_text_store, get_history, get_user_history} from "../controllers/DatabaseController.js";


const router = Router();

router.post('/text-to-isl',text_to_isl_store)
router.post('/isl-to-text',isl_to_text_store)
router.post('/get-history',get_history)
router.post('/get-user-details',get_user_history)

export default router;