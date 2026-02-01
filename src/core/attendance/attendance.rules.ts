export function validateAttendanceTimes(
  checkInAt: Date,
  checkOutAt?: Date | null,
) {
  if (checkOutAt && checkOutAt.getTime() < checkInAt.getTime()) {
    throw new Error('checkOutAt must be after checkInAt');
  }
}
