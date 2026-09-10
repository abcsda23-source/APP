import { DEFAULT_NAMES } from "../data/data";

export function createStudent(name, id) {
  return {
    id,
    name,
    attendance: {},
    grades: {},
  };
}

export function createDefaultStudents() {
  return DEFAULT_NAMES.map((name, index) =>
    createStudent(name, index + 1)
  );
}

export function loadStudents() {
  try {
    const saved = localStorage.getItem(
      "attendance_students"
    );

    if (!saved) {
      return createDefaultStudents();
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return createDefaultStudents();
    }

    return parsed;
  } catch {
    return createDefaultStudents();
  }
}

export function formatDate(date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getInitialDate() {
  return new Date(2026, 8, 10);
}