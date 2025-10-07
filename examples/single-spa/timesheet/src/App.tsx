import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import "./App.css";
import { getTimesheetData, getEmployee } from "./utils/api.ts";

// Types for the timesheet data coming from the API
export type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface TimesheetEntry {
  id: string;
  EmployeeNumber: string;
  weekDay: WeekDay;
  shift: number; // e.g., 1 or 2
  url?: string;
}

interface TimesheetListResponse {
  results: TimesheetEntry[];
  next: boolean;
}

// Employee details type (from employees API)
interface Employee {
  id: string;
  EmployeeNumber: string;
  name: string;
  surname: string;
  address: string;
  phone: string;
  email: string;
  birthday: string;
  level: string;
  url?: string;
}

const WEEK_DAYS: WeekDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function App() {
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Employee selection/detail state
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [empLoading, setEmpLoading] = useState<boolean>(false);
  const [empError, setEmpError] = useState<string | null>(null);
  const empSubs = useRef<Array<{ unsubscribe?: () => void }>>([]);
  const empCacheRef = useRef<Record<string, Employee>>({});
  const [employeesByCode, setEmployeesByCode] = useState<Record<string, Employee>>({});

  useEffect(() => {
    let isCancelled = false;
    const subs: Array<{ unsubscribe?: () => void }> = [];

    const loadPage = (page: number) => {
      const sub = getTimesheetData(page).subscribe({
        next: (data: TimesheetListResponse | TimesheetEntry) => {
          if (isCancelled) return;
          const isList = (data as TimesheetListResponse)?.results !== undefined;
          const list = isList
            ? (data as TimesheetListResponse).results
            : [data as TimesheetEntry];
          setEntries((prev) => [...prev, ...list]);

          const hasNext = isList ? (data as TimesheetListResponse).next : false;
          if (hasNext) {
            loadPage(page + 1);
          } else {
            setLoading(false);
          }
        },
        error: (err: unknown) => {
          if (isCancelled) return;
          console.error("Failed to load timesheet", err);
          setError("Failed to load timesheet.");
          setLoading(false);
        },
      });
      subs.push(sub);
    };

    loadPage(1);

    return () => {
      isCancelled = true;
      subs.forEach((s) => s.unsubscribe && s.unsubscribe());
    };
  }, []);

  // Cleanup employee subscriptions on unmount
  useEffect(() => {
    return () => {
      empSubs.current.forEach((s) => s.unsubscribe && s.unsubscribe());
    };
  }, []);

  // Prefetch employee details for displayed EmployeeNumbers to show names on chips
  useEffect(() => {
    if (!entries.length) return;
    const codes = Array.from(new Set(entries.map((e) => e.EmployeeNumber)));
    const toFetch = codes.filter((code) => !empCacheRef.current[code] && !employeesByCode[code]);
    if (toFetch.length === 0) return;

    const subs = toFetch.map((code) =>
      getEmployee(code).subscribe({
        next: (emp: Employee) => {
          if (!emp) return;
          empCacheRef.current[code] = emp;
          setEmployeesByCode((prev) => ({ ...prev, [code]: emp }));
        },
        error: (err: unknown) => {
          console.warn("Could not prefetch employee", code, err);
        },
      })
    );

    empSubs.current.push(...subs);

    return () => {
      subs.forEach((s) => s.unsubscribe && s.unsubscribe());
    };
  }, [entries, employeesByCode]);

  // Handle clicking an employee chip to show details
  const handleSelectEmployee = (code: string) => {
    setSelectedCode(code);
    setEmpError(null);

    const cached = empCacheRef.current[code];
    if (cached) {
      setSelectedEmployee(cached);
      return;
    }

    setEmpLoading(true);
    const sub = getEmployee(code).subscribe({
      next: (emp: Employee) => {
        empCacheRef.current[code] = emp;
        setSelectedEmployee(emp);
        setEmpLoading(false);
      },
      error: (err: unknown) => {
        console.error("Failed to load employee", err);
        setEmpError("Failed to load employee.");
        setEmpLoading(false);
      },
    });
    empSubs.current.push(sub);
  };

  const content = useMemo(() => {
    if (loading) {
      return <p>Loading timesheet…</p>;
    }
    if (error) {
      return (
        <div role="alert" style={{ color: "#b00020" }}>
          {error}
        </div>
      );
    }
    if (!entries.length) {
      return <p>No timesheet data for this week.</p>;
    }
    return <TimesheetSchedule entries={entries} onSelectEmployee={handleSelectEmployee} employeesByCode={employeesByCode} />;
  }, [entries, error, loading, handleSelectEmployee, employeesByCode]);

  return (
    <>
      <h1>Weekly Timesheet</h1>
      <p style={{ marginTop: -10, color: "var(--ts-muted-text)" }}>Schedule view for the current week</p>
      <div className="card" style={{ width: "100%", overflowX: "auto" }}>{content}</div>

      {selectedCode && (
        <div className="card" style={{ marginTop: 12, textAlign: "left" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>
              Employee details {selectedEmployee ? `— ${selectedEmployee.name} ${selectedEmployee.surname} (${selectedEmployee.EmployeeNumber})` : `— ${selectedCode}`}
            </h2>
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCode(null);
                  setSelectedEmployee(null);
                  setEmpError(null);
                }}
                style={{ fontSize: 12 }}
                aria-label="Clear selected employee"
              >
                Clear
              </button>
            </div>
          </div>

          {empLoading && !selectedEmployee && <p>Loading employee…</p>}
          {empError && (
            <div role="alert" style={{ color: "#b00020", marginTop: 8 }}>{empError}</div>
          )}
          {selectedEmployee && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 10 }}>
              <div><strong>Employee #:</strong> {selectedEmployee.EmployeeNumber}</div>
              <div><strong>Name:</strong> {selectedEmployee.name} {selectedEmployee.surname}</div>
              <div><strong>Level:</strong> {selectedEmployee.level}</div>
              <div><strong>Email:</strong> {selectedEmployee.email}</div>
              <div><strong>Phone:</strong> {selectedEmployee.phone}</div>
              <div><strong>Birthday:</strong> {selectedEmployee.birthday}</div>
              <div style={{ gridColumn: "1 / -1" }}><strong>Address:</strong> {selectedEmployee.address}</div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function TimesheetSchedule({ entries, onSelectEmployee, employeesByCode }: { entries: TimesheetEntry[]; onSelectEmployee: (code: string) => void; employeesByCode: Record<string, Employee> }) {
  // Derive the unique set of shifts present (e.g., [1,2])
  const shifts = useMemo(() => {
    const unique = Array.from(new Set(entries.map((e) => e.shift)));
    unique.sort((a, b) => a - b);
    return unique;
  }, [entries]);

  // Group entries by day then by shift
  const byDayShift = useMemo(() => {
    const map = new Map<WeekDay, Map<number, TimesheetEntry[]>>();
    WEEK_DAYS.forEach((d) => map.set(d, new Map<number, TimesheetEntry[]>()));
    for (const e of entries) {
      const day = e.weekDay;
      if (!map.has(day)) map.set(day, new Map<number, TimesheetEntry[]>());
      const dayMap = map.get(day)!;
      const list = dayMap.get(e.shift) ?? [];
      list.push(e);
      dayMap.set(e.shift, list);
    }
    return map;
  }, [entries]);

  const tableStyle: React.CSSProperties = {
    borderCollapse: "separate",
    borderSpacing: 0,
    minWidth: 720,
    width: "100%",
  };
  const thTdBase: React.CSSProperties = {
    border: "1px solid var(--ts-border)",
    padding: "10px 12px",
    verticalAlign: "top",
    background: "var(--ts-surface)",
    color: "var(--ts-text)",
  };
  const headerCellStyle: React.CSSProperties = {
    ...thTdBase,
    background: "var(--ts-surface-muted)",
    fontWeight: 600,
    textAlign: "center",
    position: "sticky",
    top: 0,
    zIndex: 1,
  };
  const firstColStyle: React.CSSProperties = {
    ...thTdBase,
    background: "var(--ts-surface-muted)",
    fontWeight: 600,
    whiteSpace: "nowrap",
    position: "sticky",
    left: 0,
    zIndex: 1,
  };
  const chipStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 9999,
    background: "var(--ts-chip-bg)",
    color: "var(--ts-chip-text)",
    border: "1px solid var(--ts-chip-border)",
    fontSize: 12,
    margin: 2,
  };

  return (
    <div style={{ marginTop: 12 }}>
      <table style={tableStyle} aria-label="Weekly schedule">
        <thead>
          <tr>
            <th style={headerCellStyle} aria-hidden>
              Shift
            </th>
            {WEEK_DAYS.map((day) => (
              <th key={day} style={headerCellStyle} scope="col">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift}>
              <th style={firstColStyle} scope="row">
                Shift {shift}
              </th>
              {WEEK_DAYS.map((day) => {
                const entriesForCell = byDayShift.get(day)?.get(shift) ?? [];
                return (
                  <td key={`${day}-${shift}`} style={thTdBase}>
                    {entriesForCell.length === 0 ? (
                      <span style={{ color: "var(--ts-muted-text)" }}>—</span>
                    ) : (
                      <div aria-label={`Employees on ${day} shift ${shift}`}>
                        {entriesForCell.map((e) => (
                          <button
                            key={e.id}
                            type="button"
                            style={{
                              ...chipStyle,
                              cursor: "pointer",
                            } as CSSProperties}
                            onClick={() => onSelectEmployee(e.EmployeeNumber)}
                            title={`View details for ${employeesByCode[e.EmployeeNumber] ? `${e.EmployeeNumber} — ${employeesByCode[e.EmployeeNumber].name} ${employeesByCode[e.EmployeeNumber].surname}` : e.EmployeeNumber}`}
                            aria-label={`View details for ${employeesByCode[e.EmployeeNumber] ? `${e.EmployeeNumber} — ${employeesByCode[e.EmployeeNumber].name} ${employeesByCode[e.EmployeeNumber].surname}` : e.EmployeeNumber}`}
                          >
                            {employeesByCode[e.EmployeeNumber]
                              ? `${e.EmployeeNumber} — ${employeesByCode[e.EmployeeNumber].name} ${employeesByCode[e.EmployeeNumber].surname}`
                              : e.EmployeeNumber}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
