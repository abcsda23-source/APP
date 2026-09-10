import { useEffect, useMemo, useState } from "react";
import "./App.css";

import {
  SUBJECTS,
  MONTHS,
  WEEK_DAYS,
} from "./data/data";

import {
  createStudent,
  createDefaultStudents,
  loadStudents,
  formatDate,
  getInitialDate,
} from "./utils/helpers";
import Footer from "./components/Footer";
import Header from "./components/Header";



function App() {
  const [students, setStudents] = useState(loadStudents);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("attendance_dark") === "true";
  });

  const [page, setPage] = useState("journal");

  const [selectedDate, setSelectedDate] = useState(getInitialDate);

  const [subject, setSubject] = useState(SUBJECTS[0]);

  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [editingName, setEditingName] = useState("");

  const [gradeValue, setGradeValue] = useState("");

  const [notification, setNotification] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "attendance_students",
      JSON.stringify(students)
    );
  }, [students]);

  useEffect(() => {
    localStorage.setItem(
      "attendance_dark",
      String(darkMode)
    );
  }, [darkMode]);

  function notify(message) {
    setNotification(message);

    setTimeout(() => {
      setNotification("");
    }, 2000);
  }

  function changeMonth(direction) {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  }

  function getAttendance(student, date, selectedSubject) {
    const key = formatDate(date);

    return (
      student?.attendance?.[key]?.[selectedSubject] || ""
    );
  }

  function setAttendance(studentId, status) {
    const key = formatDate(selectedDate);

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) {
          return student;
        }

        const attendance = {
          ...(student.attendance || {}),
        };

        attendance[key] = {
          ...(attendance[key] || {}),
          [subject]: status,
        };

        return {
          ...student,
          attendance,
        };
      })
    );

    notify("Посещаемость сохранена");
  }

  function addStudent() {
    const name = newName.trim();

    if (!name) {
      notify("Введите имя студента");
      return;
    }

    const newStudent = createStudent(
      name,
      Date.now()
    );

    setStudents((prev) => [...prev, newStudent]);

    setNewName("");
    setShowAddModal(false);

    notify("Студент добавлен");
  }

  function deleteStudent(id) {
    const student = students.find(
      (item) => item.id === id
    );

    if (!student) return;

    const confirmDelete = window.confirm(
      `Удалить студента "${student.name}"?`
    );

    if (!confirmDelete) return;

    setStudents((prev) =>
      prev.filter((item) => item.id !== id)
    );

    if (selectedStudent?.id === id) {
      setSelectedStudent(null);
      setPage("students");
    }

    notify("Студент удалён");
  }

  function startEdit(student) {
    setEditingId(student.id);
    setEditingName(student.name);
  }

  function saveEdit(id) {
    const name = editingName.trim();

    if (!name) {
      notify("Имя не может быть пустым");
      return;
    }

    setStudents((prev) =>
      prev.map((student) =>
        student.id === id
          ? { ...student, name }
          : student
      )
    );

    setEditingId(null);
    setEditingName("");

    notify("Имя изменено");
  }

  function addGrade(studentId) {
    const value = Number(gradeValue);

    if (!value || value < 1 || value > 5) {
      notify("Введите оценку от 1 до 5");
      return;
    }

    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) {
          return student;
        }

        const grades = {
          ...(student.grades || {}),
        };

        grades[subject] = [
          ...(grades[subject] || []),
          value,
        ];

        return {
          ...student,
          grades,
        };
      })
    );

    setGradeValue("");

    notify("Оценка добавлена");
  }

  function deleteGrade(studentId, subjectName, index) {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) {
          return student;
        }

        const grades = {
          ...(student.grades || {}),
        };

        grades[subjectName] = (
          grades[subjectName] || []
        ).filter((_, i) => i !== index);

        return {
          ...student,
          grades,
        };
      })
    );

    notify("Оценка удалена");
  }

  function getStats(student) {
    let present = 0;
    let absent = 0;
    let nb = 0;

    const attendance = student?.attendance || {};

    Object.values(attendance).forEach((day) => {
      Object.values(day || {}).forEach((status) => {
        if (status === "Б") present++;
        if (status === "Н") absent++;
        if (status === "НБ") nb++;
      });
    });

    const total = present + absent + nb;

    const percent =
      total > 0
        ? Math.round((present / total) * 100)
        : 0;

    return {
      present,
      absent,
      nb,
      total,
      percent,
    };
  }

  function getAverageGrade(student) {
    const grades = [];

    Object.values(student?.grades || {}).forEach(
      (subjectGrades) => {
        if (Array.isArray(subjectGrades)) {
          grades.push(...subjectGrades);
        }
      }
    );

    if (!grades.length) {
      return 0;
    }

    const sum = grades.reduce(
      (acc, grade) => acc + Number(grade),
      0
    );

    return (sum / grades.length).toFixed(1);
  }

  function resetAllData() {
    const confirmReset = window.confirm(
      "Удалить всех студентов и все данные журнала?"
    );

    if (!confirmReset) return;

    setStudents([]);
    setSelectedStudent(null);

    localStorage.removeItem("attendance_students");

    notify("Все данные удалены");
  }

  function restoreStudents() {
    const confirmRestore = window.confirm(
      "Восстановить стандартные 20 студентов?"
    );

    if (!confirmRestore) return;

    setStudents(createDefaultStudents());

    notify("20 студентов восстановлены");
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      student.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [students, search]);

  const globalStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let nb = 0;

    students.forEach((student) => {
      const stats = getStats(student);

      present += stats.present;
      absent += stats.absent;
      nb += stats.nb;
    });

    const total = present + absent + nb;

    const percent =
      total > 0
        ? Math.round((present / total) * 100)
        : 0;

    return {
      present,
      absent,
      nb,
      total,
      percent,
    };
  }, [students]);

  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    );

    const lastDay = new Date(
      year,
      month + 1,
      0
    );

    let startDay = firstDay.getDay();

    if (startDay === 0) {
      startDay = 7;
    }

    const days = [];

    for (let i = 1; i < startDay; i++) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= lastDay.getDate();
      day++
    ) {
      days.push(
        new Date(year, month, day)
      );
    }

    return days;
  }, [selectedDate]);

  function renderCalendar() {
    return (
      <div className="calendar-card">
        <div className="calendar-header">
          <button
            className="month-button"
            onClick={() => changeMonth(-1)}
          >
            ←
          </button>

          <h2>
            {MONTHS[selectedDate.getMonth()]}{" "}
            {selectedDate.getFullYear()}
          </h2>

          <button
            className="month-button"
            onClick={() => changeMonth(1)}
          >
            →
          </button>
        </div>

        <div className="week-grid">
          {WEEK_DAYS.map((day) => (
            <div
              className="week-day"
              key={day}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  className="calendar-empty"
                  key={`empty-${index}`}
                />
              );
            }

            const dayKey = formatDate(day);

            const isSelected =
              dayKey === formatDate(selectedDate);

            const dayHasAttendance =
              students.some((student) =>
                Object.values(
                  student.attendance?.[dayKey] || {}
                ).some(Boolean)
              );

            return (
              <button
                key={dayKey}
                className={`calendar-day ${isSelected ? "selected" : ""
                  } ${dayHasAttendance
                    ? "has-attendance"
                    : ""
                  }`}
                onClick={() =>
                  setSelectedDate(day)
                }
              >
                <span>{day.getDate()}</span>

                {dayHasAttendance && (
                  <small>●</small>
                )}
              </button>
            );
          })}
        </div>

        <div className="calendar-info">
          Выбранная дата:{" "}
          <strong>
            {selectedDate.toLocaleDateString(
              "ru-RU"
            )}
          </strong>
        </div>
      </div>
    );
  }

  function renderStatsCards() {
    return (
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            👨‍🎓
          </div>
          <div>
            <span>Студентов</span>
            <strong>{students.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            Б
          </div>
          <div>
            <span>Были</span>
            <strong>
              {globalStats.present}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            Н
          </div>
          <div>
            <span>Отсутствовали</span>
            <strong>
              {globalStats.absent}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            НБ
          </div>
          <div>
            <span>НБ</span>
            <strong>
              {globalStats.nb}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            %
          </div>
          <div>
            <span>Посещаемость</span>
            <strong>
              {globalStats.percent}%
            </strong>
          </div>
        </div>
      </div>
    );
  }

  function renderJournal() {
    return (
      <>
        <div className="page-title">
          <div>
            <h1>Электронный журнал</h1>
            <p>
              Посещаемость студентов по дням и предметам
            </p>
          </div>
        </div>

        {renderStatsCards()}

        {renderCalendar()}

        <div className="journal-card">
          <div className="journal-top">
            <div>
              <h2>Посещаемость</h2>

              <p>
                {selectedDate.toLocaleDateString(
                  "ru-RU"
                )}
              </p>
            </div>

            <select
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
            >
              {SUBJECTS.map((item) => (
                <option
                  value={item}
                  key={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          {students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                👨‍🎓
              </div>

              <h3>
                Студентов пока нет
              </h3>

              <p>
                Добавьте студентов, чтобы начать
                вести журнал.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  setShowAddModal(true)
                }
              >
                + Добавить студента
              </button>
            </div>
          ) : (
            <div className="attendance-list">
              {students.map((student, index) => {
                const status = getAttendance(
                  student,
                  selectedDate,
                  subject
                );

                return (
                  <div
                    className="attendance-row"
                    key={student.id}
                  >
                    <div className="student-number">
                      {index + 1}
                    </div>

                    <div className="student-mini">
                      <div className="avatar">
                        {student.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {student.name}
                        </strong>

                        <span>
                          {subject}
                        </span>
                      </div>
                    </div>

                    <div className="attendance-buttons">
                      <button
                        className={
                          status === "Б"
                            ? "active present"
                            : "present"
                        }
                        onClick={() =>
                          setAttendance(
                            student.id,
                            "Б"
                          )
                        }
                      >
                        Б
                      </button>

                      <button
                        className={
                          status === "Н"
                            ? "active absent"
                            : "absent"
                        }
                        onClick={() =>
                          setAttendance(
                            student.id,
                            "Н"
                          )
                        }
                      >
                        Н
                      </button>

                      <button
                        className={
                          status === "НБ"
                            ? "active nb"
                            : "nb"
                        }
                        onClick={() =>
                          setAttendance(
                            student.id,
                            "НБ"
                          )
                        }
                      >
                        НБ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  function renderStudents() {
    return (
      <>
        <div className="page-title students-title">
          <div>
            <h1>Студенты</h1>
            <p>
              Всего студентов: {students.length}
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              setShowAddModal(true)
            }
          >
            + Добавить
          </button>
        </div>

        <div className="search-box">
          <span>⌕</span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Поиск студента..."
          />
        </div>

        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              👨‍🎓
            </div>

            <h3>
              {students.length === 0
                ? "Студентов нет"
                : "Ничего не найдено"}
            </h3>

            {students.length === 0 && (
              <button
                className="primary-button"
                onClick={() =>
                  setShowAddModal(true)
                }
              >
                + Добавить студента
              </button>
            )}
          </div>
        ) : (
          <div className="students-grid">
            {filteredStudents.map(
              (student, index) => {
                const stats =
                  getStats(student);

                const average =
                  getAverageGrade(student);

                return (
                  <div
                    className="student-card"
                    key={student.id}
                  >
                    <div className="student-card-top">
                      <div className="big-avatar">
                        {student.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="student-index">
                        #{index + 1}
                      </span>
                    </div>

                    {editingId === student.id ? (
                      <div className="edit-name">
                        <input
                          value={editingName}
                          onChange={(event) =>
                            setEditingName(
                              event.target.value
                            )
                          }
                        />

                        <div>
                          <button
                            onClick={() =>
                              saveEdit(
                                student.id
                              )
                            }
                          >
                            Сохранить
                          </button>

                          <button
                            onClick={() =>
                              setEditingId(null)
                            }
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3>{student.name}</h3>

                        <p className="semester">
                          1 семестр
                        </p>

                        <div className="student-stats">
                          <div>
                            <span>
                              Посещаемость
                            </span>

                            <strong>
                              {stats.percent}%
                            </strong>
                          </div>

                          <div>
                            <span>
                              Средний балл
                            </span>

                            <strong>
                              {average || "—"}
                            </strong>
                          </div>
                        </div>

                        <div className="progress">
                          <div
                            style={{
                              width: `${stats.percent}%`,
                            }}
                          />
                        </div>

                        <div className="card-actions">
                          <button
                            onClick={() => {
                              setSelectedStudent(
                                student
                              );
                              setPage("profile");
                            }}
                          >
                            Профиль
                          </button>

                          <button
                            onClick={() =>
                              startEdit(student)
                            }
                          >
                            Изменить
                          </button>

                          <button
                            className="delete-button"
                            onClick={() =>
                              deleteStudent(
                                student.id
                              )
                            }
                          >
                            Удалить
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </>
    );
  }

  function renderProfile() {
    if (!selectedStudent) {
      return (
        <div className="empty-state">
          <h2>Студент не выбран</h2>

          <button
            className="primary-button"
            onClick={() => setPage("students")}
          >
            Вернуться к студентам
          </button>
        </div>
      );
    }

    const student = students.find(
      (item) => item.id === selectedStudent.id
    );

    if (!student) {
      setSelectedStudent(null);

      return null;
    }

    const stats = getStats(student);

    return (
      <>
        <button
          className="back-button"
          onClick={() => setPage("students")}
        >
          ← Назад к студентам
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            {student.name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h1>{student.name}</h1>

            <p>
              4 семестр · Студент
            </p>
          </div>
        </div>

        <div className="profile-stats">
          <div>
            <span>Посещаемость</span>
            <strong>
              {stats.percent}%
            </strong>
          </div>

          <div>
            <span>Был</span>
            <strong>
              {stats.present}
            </strong>
          </div>

          <div>
            <span>Н</span>
            <strong>
              {stats.absent}
            </strong>
          </div>

          <div>
            <span>НБ</span>
            <strong>
              {stats.nb}
            </strong>
          </div>

          <div>
            <span>Средний балл</span>
            <strong>
              {getAverageGrade(student) || "—"}
            </strong>
          </div>
        </div>

        <div className="grade-section">
          <div className="section-heading">
            <div>
              <h2>Оценки</h2>
              <p>
                Добавляйте оценки по предметам
              </p>
            </div>

            <select
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
            >
              {SUBJECTS.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grade-add">
            <input
              type="number"
              min="1"
              max="5"
              value={gradeValue}
              onChange={(event) =>
                setGradeValue(event.target.value)
              }
              placeholder="Оценка 1–5"
            />

            <button
              className="primary-button"
              onClick={() =>
                addGrade(student.id)
              }
            >
              + Добавить оценку
            </button>
          </div>

          <div className="grades-grid">
            {SUBJECTS.map(
              (subjectName) => {
                const grades =
                  student.grades?.[
                  subjectName
                  ] || [];

                return (
                  <div
                    className="subject-grade-card"
                    key={subjectName}
                  >
                    <h3>
                      {subjectName}
                    </h3>

                    {grades.length === 0 ? (
                      <p className="no-grades">
                        Оценок пока нет
                      </p>
                    ) : (
                      <div className="grades-list">
                        {grades.map(
                          (grade, index) => (
                            <button
                              key={`${grade}-${index}`}
                              onClick={() =>
                                deleteGrade(
                                  student.id,
                                  subjectName,
                                  index
                                )
                              }
                              title="Нажмите, чтобы удалить"
                            >
                              {grade}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
      </>
    );
  }

  function renderAnalytics() {
    const subjectStats =
      SUBJECTS.map((subjectName) => {
        let present = 0;
        let total = 0;

        students.forEach((student) => {
          Object.values(
            student.attendance || {}
          ).forEach((day) => {
            const status =
              day?.[subjectName];

            if (status) {
              total++;

              if (status === "Б") {
                present++;
              }
            }
          });
        });

        const percent =
          total > 0
            ? Math.round(
              (present / total) * 100
            )
            : 0;

        return {
          subjectName,
          present,
          total,
          percent,
        };
      });

    return (
      <>
        <div className="page-title">
          <div>
            <h1>Аналитика</h1>
            <p>
              Общая статистика группы
            </p>
          </div>
        </div>

        <div className="analytics-top">
          <div className="circle-card">
            <div
              className="circle"
              style={{
                "--percent": `${globalStats.percent}%`,
              }}
            >
              <div>
                <strong>
                  {globalStats.percent}%
                </strong>

                <span>
                  посещаемость
                </span>
              </div>
            </div>

            <h2>
              Общая посещаемость
            </h2>
          </div>

          <div className="analytics-numbers">
            <div>
              <span>Всего отметок</span>
              <strong>
                {globalStats.total}
              </strong>
            </div>

            <div>
              <span>Были</span>
              <strong>
                {globalStats.present}
              </strong>
            </div>

            <div>
              <span>Н</span>
              <strong>
                {globalStats.absent}
              </strong>
            </div>

            <div>
              <span>НБ</span>
              <strong>
                {globalStats.nb}
              </strong>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h2>
            Посещаемость студентов
          </h2>

          <div className="analytics-list">
            {students.length === 0 ? (
              <div className="empty-small">
                Нет студентов для аналитики
              </div>
            ) : (
              students.map((student) => {
                const stats =
                  getStats(student);

                return (
                  <div
                    className="analytics-row"
                    key={student.id}
                  >
                    <div className="analytics-name">
                      <div className="avatar">
                        {student.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <strong>
                        {student.name}
                      </strong>
                    </div>

                    <div className="analytics-progress">
                      <div className="progress">
                        <div
                          style={{
                            width: `${stats.percent}%`,
                          }}
                        />
                      </div>
                    </div>

                    <strong>
                      {stats.percent}%
                    </strong>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="analytics-section">
          <h2>
            По предметам
          </h2>

          <div className="subject-analytics">
            {subjectStats.map(
              (item) => (
                <div
                  className="subject-analytics-card"
                  key={item.subjectName}
                >
                  <div>
                    <strong>
                      {item.subjectName}
                    </strong>

                    <span>
                      {item.percent}%
                    </span>
                  </div>

                  <div className="progress">
                    <div
                      style={{
                        width: `${item.percent}%`,
                      }}
                    />
                  </div>

                  <small>
                    Было: {item.present} из{" "}
                    {item.total}
                  </small>
                </div>
              )
            )}
          </div>
        </div>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <div className="page-title">
          <div>
            <h1>Настройки</h1>
            <p>
              Настройки электронного журнала
            </p>
          </div>
        </div>

        <div className="settings-list">
          <div className="setting-card">
            <div>
              <h3>Тёмная тема</h3>
              <p>
                Изменить внешний вид приложения
              </p>
            </div>

            <button
              className={`switch ${darkMode ? "on" : ""
                }`}
              onClick={() =>
                setDarkMode((prev) => !prev)
              }
            >
              <span />
            </button>
          </div>

          <div className="setting-card">
            <div>
              <h3>Учебный семестр</h3>
              <p>
                Текущий учебный период
              </p>
            </div>

            <strong>4 семестр</strong>
          </div>

          <div className="setting-card">
            <div>
              <h3>Количество студентов</h3>
              <p>
                Студенты этой группы
              </p>
            </div>

            <strong>
              {students.length}
            </strong>
          </div>

          <div className="setting-card">
            <div>
              <h3>Предметы</h3>
              <p>
                Количество предметов
              </p>
            </div>

            <strong>
              {SUBJECTS.length}
            </strong>
          </div>

          <div className="setting-danger">
            <div>
              <h3>
                Удалить все данные
              </h3>

              <p>
                Удалятся студенты,
                посещаемость и оценки.
              </p>
            </div>

            <button
              className="danger-button"
              onClick={resetAllData}
            >
              Удалить всё
            </button>
          </div>

          {students.length === 0 && (
            <div className="setting-card">
              <div>
                <h3>
                  Восстановить студентов
                </h3>

                <p>
                  Вернуть стандартные 20
                  студентов.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={restoreStudents}
              >
                Восстановить
              </button>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <div
      className={`app ${darkMode ? "dark" : ""
        }`}
    >
      <Header
        page={page}
        setPage={setPage}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="main">
        {page === "journal" &&
          renderJournal()}

        {page === "students" &&
          renderStudents()}

        {page === "profile" &&
          renderProfile()}

        {page === "analytics" &&
          renderAnalytics()}

        {page === "settings" &&
          renderSettings()}
      </main>

      <Footer />

      {showAddModal && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowAddModal(false)
          }
        >
          <div
            className="modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={() =>
                setShowAddModal(false)
              }
            >
              ×
            </button>

            <h2>
              Добавить студента
            </h2>

            <p>
              Введите имя нового студента
            </p>

            <input
              autoFocus
              value={newName}
              onChange={(event) =>
                setNewName(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  addStudent();
                }
              }}
              placeholder="Имя студента"
            />

            <button
              className="primary-button full"
              onClick={addStudent}
            >
              Добавить студента
            </button>
          </div>
        </div>
      )}

      {notification && (
        <div className="toast">
          ✓ {notification}
        </div>
      )}
    </div>
  );
}

export default App;