import type { Request, Response } from "express";
import express from "express";
import userService from "../../services/userService.js";
import { ValidationError } from "objection";
import User from "../../models/User.js";

const router = express.Router();

const filterRoute = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      filter,
      sort
    } = req.method === "GET" ? req.query : req.body;
    const pageNum = parseInt(page as string, 10) || 1;
    const pageSizeNum = parseInt(pageSize as string, 10) || 10;

    const filterOps = filter ? JSON.parse(filter.toString()) : [];
    const sortOps = sort ? JSON.parse(sort.toString()) : [];

    const users = await userService.getUsers(
      filterOps,
      sortOps,
      pageNum,
      pageSizeNum
    );
    return res.json(users);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

router.get("/", filterRoute);
router.post("/filter", filterRoute);

router.post("/", async (req: Request, res: Response) => {
  try {
    const data = req.body as Partial<{ email: string }>;
    if (!data.email) {
      return res
        .status(400)
        .json({ success: false, error: "Email is required" });
    }

    const existed = await User.query().where("email", data.email).first();
    if (existed) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }

    const newUser = await userService.createUser(req.body);
    return res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    if (!req.params.id || isNaN(parseInt(req.params.id, 10))) {
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }

    const userId = parseInt(req.params.id, 10);
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    if (!req.params.id || isNaN(parseInt(req.params.id, 10))) {
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }

    const userId = parseInt(req.params.id, 10);

    const existed = await User.query()
      .where("email", req.body.email)
      .where("id", "!=", userId)
      .first();
    if (existed) {
      return res
        .status(400)
        .json({ success: false, error: "Email already exists" });
    }

    const updatedUser = await userService.updateUser(userId, req.body);

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    if (!req.params.id || isNaN(parseInt(req.params.id, 10))) {
      return res.status(400).json({ success: false, error: "Invalid user ID" });
    }

    const userId = parseInt(req.params.id, 10);
    const success = await userService.deleteUser(userId);

    if (!success) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

export default router;
