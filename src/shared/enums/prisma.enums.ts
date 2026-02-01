import {
  ExportFormat as PrismaExportFormat,
  OvertimeStatus as PrismaOvertimeStatus,
  PayrollStatus as PrismaPayrollStatus,
  ReportType as PrismaReportType,
  StudentAttendanceStatus as PrismaStudentAttendanceStatus,
  type ExportFormat as ExportFormatType,
  type OvertimeStatus as OvertimeStatusType,
  type PayrollStatus as PayrollStatusType,
  type ReportType as ReportTypeType,
  type StudentAttendanceStatus as StudentAttendanceStatusType,
} from '../../../prisma/generated/prisma';

export const ExportFormatEnum = PrismaExportFormat;
export type ExportFormat = ExportFormatType;

export const OvertimeStatusEnum = PrismaOvertimeStatus;
export type OvertimeStatus = OvertimeStatusType;

export const PayrollStatusEnum = PrismaPayrollStatus;
export type PayrollStatus = PayrollStatusType;

export const ReportTypeEnum = PrismaReportType;
export type ReportType = ReportTypeType;

export const StudentAttendanceStatusEnum = PrismaStudentAttendanceStatus;
export type StudentAttendanceStatus = StudentAttendanceStatusType;
