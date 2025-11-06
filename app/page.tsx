"use client";

import { useEffect, useState } from "react";

type Workout = {
    id: number;
    name: string;
    sets: number;
    reps: number;
    weight: number;
    createdat: string;
};

export default function Page() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [newWorkout, setNewWorkout] = useState({ name: "", sets: "", reps: "", weight: "" });

    // Fetch workouts
    useEffect(() => {
        const fetchWorkouts = async () => {
            const res = await fetch("/api/workouts");
            const data = await res.json();
            setWorkouts(data);
        };
        fetchWorkouts();
    }, []);

    // Add workout
    const addWorkout = async () => {
        if (!newWorkout.name.trim()) return;

        const res = await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newWorkout.name,
                sets: Number(newWorkout.sets) || 0,
                reps: Number(newWorkout.reps) || 0,
                weight: Number(newWorkout.weight) || 0,
            }),
        });

        const data = await res.json();
        setWorkouts((prev) => [...prev, data]);
        setNewWorkout({ name: "", sets: "", reps: "", weight: "" });
    };

    // Update field
    const updateWorkout = async (id: number, field: keyof Workout, value: number) => {
        const updated = workouts.map((w) => (w.id === id ? { ...w, [field]: value } : w));
        setWorkouts(updated);

        await fetch(`/api/workouts`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, [field]: value }),
        });
    };

    // Delete
    const deleteWorkout = async (id: number) => {
        await fetch(`/api/workouts?id=${id}`, { method: "DELETE" });
        setWorkouts((prev) => prev.filter((w) => w.id !== id));
    };

    return (
        <main className="min-h-screen bg-black text-white p-4">
            <h1 className="text-2xl font-bold mb-6 text-center">Workout Tracker</h1>

            {/* Add new workout */}
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                    className="bg-zinc-900 px-3 py-2 rounded-lg flex-1"
                    placeholder="Workout name"
                    value={newWorkout.name}
                    onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                />
                <input
                    type={"number"}
                    className="bg-zinc-900 px-3 py-2 rounded-lg w-20 text-center"
                    placeholder="Sets"
                    value={newWorkout.sets}
                    onChange={(e) => setNewWorkout({ ...newWorkout, sets: e.target.value })}
                />
                <input
                    type={"number"}
                    className="bg-zinc-900 px-3 py-2 rounded-lg w-20 text-center"
                    placeholder="Reps"
                    value={newWorkout.reps}
                    onChange={(e) => setNewWorkout({ ...newWorkout, reps: e.target.value })}
                />
                <input
                    type={"number"}
                    className="bg-zinc-900 px-3 py-2 rounded-lg w-24 text-center"
                    placeholder="Weight"
                    value={newWorkout.weight}
                    onChange={(e) => setNewWorkout({ ...newWorkout, weight: e.target.value })}
                />
                <button
                    onClick={addWorkout}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-semibold"
                >
                    Add
                </button>
            </div>

            {/* Workouts */}
            <div className="space-y-3">
                {workouts.map((workout) => (
                    <div
                        key={workout.id}
                        className="grid grid-cols-4 items-center bg-zinc-900 rounded-2xl p-3 text-center"
                    >
                        {/* Name */}
                        <div className="flex flex-col justify-center">
                            <span className="font-medium">{workout.name}</span>
                            <button
                                onClick={() => deleteWorkout(workout.id)}
                                className="text-xs text-zinc-500 hover:text-zinc-300 mt-1"
                            >
                                delete
                            </button>
                        </div>

                        {/* Sets */}
                        <NumberControl
                            label="Sets"
                            value={workout.sets}
                            onChange={(val) => updateWorkout(workout.id, "sets", val)}
                            step={1}
                        />

                        {/* Reps */}
                        <NumberControl
                            label="Reps"
                            value={workout.reps}
                            onChange={(val) => updateWorkout(workout.id, "reps", val)}
                            step={1}
                        />

                        {/* Weight */}
                        <NumberControl
                            label="Weight"
                            value={workout.weight}
                            onChange={(val) => updateWorkout(workout.id, "weight", val)}
                            step={1}
                        />
                    </div>
                ))}
            </div>
        </main>
    );
}

function NumberControl({
                           label,
                           value,
                           onChange,
                           step
                       }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
    step: number;
}) {
    return (
        <div className="flex flex-col items-center justify-center">
            <button
                onClick={() => onChange(value + step)}
                className="text-white text-xl leading-none hover:opacity-75"
            >
                ▲
            </button>
            <span className="text-lg">{value}</span>
            <button
                onClick={() => onChange(Math.max(0, value - step))}
                className="text-white text-xl leading-none hover:opacity-75"
            >
                ▼
            </button>
            <span className="text-xs text-zinc-400 mt-1">{label}</span>
        </div>
    );
}
