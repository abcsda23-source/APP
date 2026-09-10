function Header({
    page,
    setPage,
    darkMode,
    setDarkMode,
}) {
    return (
        <header className="header">
            <div className="header-inner">
                <button
                    className="logo"
                    onClick={() =>
                        setPage("journal")
                    }
                >
                    <span className="logo-icon">
                        Э
                    </span>

                    <span>
                        Э-Журнал
                    </span>
                </button>

                <nav className="nav">
                    <button
                        className={
                            page === "journal"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("journal")
                        }
                    >
                        📅 Журнал
                    </button>

                    <button
                        className={
                            page === "students"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("students")
                        }
                    >
                        👨‍🎓 Студенты
                    </button>

                    <button
                        className={
                            page === "analytics"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("analytics")
                        }
                    >
                        📊 Аналитика
                    </button>

                    <button
                        className={
                            page === "settings"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setPage("settings")
                        }
                    >
                        ⚙️ Настройки
                    </button>
                </nav>

                <button
                    className="theme-button"
                    onClick={() =>
                        setDarkMode((prev) => !prev)
                    }
                >
                    {darkMode ? "☀️" : "🌙"}
                </button>
            </div>
        </header>
    );
}

export default Header;