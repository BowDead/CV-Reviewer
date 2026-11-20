import {
  getReports,
  reportInvitation,
  resolveReport,
} from "../services/report.service.js";
import { reportView } from "../views/admin.view.js";

export async function postInvitationReport(req, res) {
  const reportId = await reportInvitation(req.user.id, req.params.id, req.body);
  res.status(201).json({ id: reportId });
}

export async function getReportList(req, res) {
  const reports = await getReports(req.query);
  res.json({ reports: reports.map(reportView) });
}

export async function postReportResolution(req, res) {
  const report = await resolveReport(req.params.id);
  res.json(reportView(report));
}
