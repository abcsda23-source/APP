function Calendar({
    calendarDays,
    selectedDate,
    students,
    formatDate,
    setSelectedDate,
    changeMonth,
    months,
    weekDays,
}) {
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
                    {months[selectedDate.getMonth()]}{" "}
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

                {weekDays.map((day) => (
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
                            className={`calendar-day ${
                                isSelected ? "selected" : ""
                            } ${
                                dayHasAttendance
                                    ? "has-attendance"
                                    : ""
                            }`}
                            onClick={() =>
                                setSelectedDate(day)
                            }
                        >

                            <span>
                                {day.getDate()}
                            </span>

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
                    {selectedDate.toLocaleDateString("ru-RU")}
                </strong>

            </div>

        </div>
    );
}

export default Calendar;