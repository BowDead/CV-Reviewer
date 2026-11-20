import { z } from "zod";
import { HttpError } from "../errors/HttpError.js";
import { findInvitation, listMessages } from "../models/invitation.model.js";
import {
  findReport,
  hasOpenReport,
  insertReport,
  listReports,
  markReportResolved,
} from "../models/report.model.js";
import { parseId } from "../utils/parse-id.js";
import { parseInput } from "../utils/parse-input.js";

const reportSchema = z.object({
  reason: z
    .string("REPORT_REASON_REQUIRED")
    .trim()
    .min(1, "REPORT_REASON_REQUIRED")
    .max(1000, "REPORT_REASON_TOO_LONG"),
});

const listSchema = z.object({
  resolved: z
    .enum(["true", "false"], "INVALID_INPUT")
    .optional()
    .transform((value) => (value === undefined ? null : value === "true")),
});

async function withMessages(report) {
  const messages = await listMessages(report.invitation.id);
  return { ...report, messages };
}

export async function reportInvitation(candidateId, invitationId, input) {
  parseId(invitationId, "INVITATION_NOT_FOUND");
  const invitation = await findInvitation(invitationId);
  if (!invitation || invitation.candidateId !== candidateId) {
    throw new HttpError(404, "INVITATION_NOT_FOUND");
  }
  const { reason } = parseInput(reportSchema, input);
  if (await hasOpenReport(candidateId, invitationId)) {
    throw new HttpError(409, "REPORT_EXISTS");
  }
  return insertReport({ reporterId: candidateId, invitationId, reason });
}

export async function getReports(input) {
  const { resolved } = parseInput(listSchema, input);
  const reports = await listReports(resolved);
  return Promise.all(reports.map(withMessages));
}

export async function resolveReport(reportId) {
  parseId(reportId, "REPORT_NOT_FOUND");
  const report = await findReport(reportId);
  if (!report) {
    throw new HttpError(404, "REPORT_NOT_FOUND");
  }
  if (!(await markReportResolved(reportId))) {
    throw new HttpError(409, "REPORT_ALREADY_RESOLVED");
  }
  return withMessages(await findReport(reportId));
}
