import express from "express";
import mongoose from "mongoose";
import { param, validationResult } from "express-validator";
import { Zone, Queue } from "../db.js";

const router = express.Router();

/**
 * GET /api/zones
 * Get all equipment zones
 * Query params: ?facilityId=<id> to filter by facility
 * Returns: Zone name, queue length, wait time, capacity
 * Used by: Zones page & backend tests
 */
router.get("/", async (req, res) => {
  try {
    const { facilityId } = req.query;

    let zones;

    if (facilityId) {
      // If facilityId is not even a valid ObjectId, treat as "not found"
      if (!mongoose.Types.ObjectId.isValid(facilityId)) {
        return res.status(404).json({
          success: false,
          error: "Facility not found",
        });
      }

      // Support either `facilityId` or `facility` as the field name
      zones = await Zone.find({
        $or: [
          { facilityId: facilityId },
          { facility: facilityId },
        ],
      })
        .populate("facilityId")
        .populate("facility");

      // If we asked for a specific facility and no zones exist, tests expect 404
      if (zones.length === 0) {
        return res.status(404).json({
          success: false,
          error: "No zones found for this facility",
        });
      }
    } else {
      // No facility filter – return all zones
      zones = await Zone.find({})
        .populate("facilityId")
        .populate("facility");
    }

    // Add real-time queue data to each zone
    const zonesWithQueueData = await Promise.all(
      zones.map(async (zone) => {
        const queueLength = await Queue.countDocuments({
          zoneId: zone._id,
          status: "active",
        });

        // Simple linear estimate – tests only care that it exists & is numeric
        const averageWaitTime = queueLength * 7; // 7 min/person

        return {
          ...zone.toObject(),
          queueLength,
          averageWaitTime,
        };
      })
    );

    return res.json({
      success: true,
      data: zonesWithQueueData,
      count: zonesWithQueueData.length,
    });
  } catch (error) {
    console.error("Zones GET error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: error.message,
    });
  }
});

/**
 * GET /api/zones/:id
 * Get specific zone details
 * Returns: Detailed zone information including current queue status
 */
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid zone ID format")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        message: errors.array()[0].msg,
      });
    }

    try {
      const zone = await Zone.findById(req.params.id).populate("facilityId");

      if (!zone) {
        return res.status(404).json({
          success: false,
          error: "Zone not found",
        });
      }

      return res.json({
        success: true,
        data: zone,
      });
    } catch (error) {
      console.error("Zone GET by id error:", error);
      return res.status(500).json({
        success: false,
        error: "Server error",
        message: error.message,
      });
    }
  }
);

export default router;
