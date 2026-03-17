/* eslint-disable @typescript-eslint/no-explicit-any */
import { IReview } from "./review.interface";
import { Review } from "./review.model";

const createReview = async (payload: IReview, userId: string) => {

  const review = await Review.create({
    ...payload,
    user: userId
  });

  if (payload.parentReview) {
    await Review.findByIdAndUpdate(payload.parentReview, {
      $push: { replies: review._id }
    });
  }

  return review;
};

const getRepliesRecursively = async (parentId: string): Promise<any[]> => {
  const replies = await Review.find({ parentReview: parentId })
    .populate("user", "name")
    .lean(); // 👈 important for performance

  for (const reply of replies) {
    reply.replies = await getRepliesRecursively(reply._id.toString());
  }

  return replies;
};

const getServiceReviews = async (serviceId: string) => {

  const reviews = await Review.find({
    service: serviceId,
    parentReview: null
  })
    .populate("user", "name")
    .lean(); // 👈 important

  for (const review of reviews) {
    review.replies = await getRepliesRecursively(review._id.toString());
  }

  return reviews;
};

const deleteReview = async (id: string) => {
  return await Review.findByIdAndDelete(id);
};

export const ReviewServices = {
  createReview,
  getServiceReviews,
  deleteReview
};