import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Schema } from "mongoose";

import Profile, { IProfile } from "../models/profileModel";

import { IAuthenticatedRequest } from "../middleware/authMiddleware";

const fetchProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { user } = req.body;

  const profile: IProfile | null = await Profile.findOne({ user });

  if (!profile) {
    res.status(404);
    throw new Error("Resource not found");
  }

  res.json({ profile });
});

const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { user, occupation, workplace, education, github, linkedin } = req.body;

  const profile: IProfile | null = await Profile.findOne({ user });

  if (!profile) {
    res.status(404);
    throw new Error("Resource not found");
  }

  if (profile.user.toString() !== (req as IAuthenticatedRequest).user._id.toString()) {
    res.status(403);
    throw new Error("Unauthorized user");
  }

  profile.occupation = occupation || profile.occupation;
  profile.workplace = workplace || profile.workplace;
  profile.education = education || profile.education;
  profile.github = github || profile.github;
  profile.linkedin = linkedin || profile.linkedin;

  await profile.save();

  const updatedProfile = await Profile.findById(profile._id)
    .populate("user", "-password")
    .populate("groupAdmin", "-password");

  res.json({ chat: updatedProfile });
});

export { fetchProfile, updateProfile };
