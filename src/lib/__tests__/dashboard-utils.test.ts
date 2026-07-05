/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";
import {
  clampPercentage,
  formatMinutes,
  formatDate,
  nextMilestone,
  isGisTask,
  isBrandingTask,
  hasCompletedMatchingTask
} from "@/lib/dashboard-utils";

describe("clampPercentage", () => {
  it("clamps values below 0 to 0", () => {
    assert.equal(clampPercentage(-1), 0);
    assert.equal(clampPercentage(-100), 0);
  });

  it("clamps values above 100 to 100", () => {
    assert.equal(clampPercentage(101), 100);
    assert.equal(clampPercentage(200), 100);
  });

  it("passes through values in range", () => {
    assert.equal(clampPercentage(0), 0);
    assert.equal(clampPercentage(50), 50);
    assert.equal(clampPercentage(100), 100);
  });
});

describe("formatMinutes", () => {
  it("returns 'No estimate' for null", () => {
    assert.equal(formatMinutes(null), "No estimate");
  });

  it("returns 'No estimate' for 0", () => {
    assert.equal(formatMinutes(0), "No estimate");
  });

  it("formats minutes less than 60", () => {
    assert.equal(formatMinutes(30), "30 min");
    assert.equal(formatMinutes(5), "5 min");
  });

  it("formats exact hours", () => {
    assert.equal(formatMinutes(60), "1h");
    assert.equal(formatMinutes(180), "3h");
  });

  it("formats hours and minutes", () => {
    assert.equal(formatMinutes(90), "1h 30m");
    assert.equal(formatMinutes(150), "2h 30m");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const date = new Date("2026-07-05T12:00:00Z");
    const result = formatDate(date);
    assert.ok(result.includes("Jul"));
    assert.ok(result.includes("2026"));
  });
});

describe("nextMilestone", () => {
  it("returns 25% milestone for progress < 25", () => {
    assert.equal(nextMilestone(0, "Test"), "Test 25% milestone");
    assert.equal(nextMilestone(24, "Test"), "Test 25% milestone");
  });

  it("returns 50% milestone for progress between 25 and 50", () => {
    assert.equal(nextMilestone(25, "Test"), "Test 50% milestone");
    assert.equal(nextMilestone(49, "Test"), "Test 50% milestone");
  });

  it("returns 75% milestone for progress between 50 and 75", () => {
    assert.equal(nextMilestone(50, "Test"), "Test 75% milestone");
    assert.equal(nextMilestone(74, "Test"), "Test 75% milestone");
  });

  it("returns 100% milestone for progress between 75 and 100", () => {
    assert.equal(nextMilestone(75, "Test"), "Test 100% milestone");
    assert.equal(nextMilestone(99, "Test"), "Test 100% milestone");
  });

  it("returns 100% milestone for progress at 100", () => {
    assert.equal(nextMilestone(100, "Test"), "Test 100% milestone");
  });
});

describe("isGisTask", () => {
  const gisTask = { projectName: "GIS Study", title: "Complete QGIS module" } as any;
  const gisTask2 = { projectName: "GIS", title: "Study" } as any;
  const nonGisTask = { projectName: "Portfolio", title: "Build website" } as any;

  it("detects GIS tasks by title", () => {
    assert.equal(isGisTask(gisTask), true);
  });

  it("detects GIS tasks by project name", () => {
    assert.equal(isGisTask(gisTask2), true);
  });

  it("returns false for non-GIS tasks", () => {
    assert.equal(isGisTask(nonGisTask), false);
  });
});

describe("isBrandingTask", () => {
  const brandingTask = { projectName: "Personal Branding", title: "Update LinkedIn" } as any;
  const linkedinTask = { projectName: "Outreach", title: "LinkedIn profile" } as any;
  const nonBrandingTask = { projectName: "GIS", title: "Complete module 1" } as any;

  it("detects branding tasks", () => {
    assert.equal(isBrandingTask(brandingTask), true);
  });

  it("detects linkedin tasks", () => {
    assert.equal(isBrandingTask(linkedinTask), true);
  });

  it("returns false for non-branding tasks", () => {
    assert.equal(isBrandingTask(nonBrandingTask), false);
  });
});

describe("hasCompletedMatchingTask", () => {
  const tasks = [
    { id: "1", projectName: "GIS Study", title: "QGIS Basics", status: "Done" },
    { id: "2", projectName: "Portfolio", title: "Build site", status: "Done" },
    { id: "3", projectName: "GIS Study", title: "Advanced QGIS", status: "To Do" }
  ] as any;

  it("finds completed tasks by keyword", () => {
    assert.equal(hasCompletedMatchingTask(tasks, "qgis"), true);
    assert.equal(hasCompletedMatchingTask(tasks, "portfolio"), true);
  });

  it("returns false if matching task is not done", () => {
    assert.equal(hasCompletedMatchingTask(tasks, "advanced"), false);
  });

  it("returns false if no match", () => {
    assert.equal(hasCompletedMatchingTask(tasks, "nonexistent"), false);
  });
});
