"use client";

import { useState, useEffect } from "react";

type Workout = {
    id: number;
    name: string;
    sets: number;
    reps: number;
    weight: number;
};

export default function Home() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [name, setName] = useState("");
    const [sets, setSets] = useState("");
    const [reps, setReps] = useState("");
    const [weight, setWeight] = useState("");
    const [loading, setLoading] = useState(false);

    // Fetch workouts from DB
    useEffect(() => {
        const fetchWorkouts = async () => {
            const res = await fetch("/api/workouts");
            if (!res.ok) return;
            const data = await res.json();
            setWorkouts(data);
        };
        fetchWorkouts();
    }, []);

    const addWorkout = async () => {
        if (!name.trim()) return;
        setLoading(true);
        const res = await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, sets, reps, weight }),
        });
        setLoading(false);

        if (res.ok) {
            const newWorkout = await res.json();
            setWorkouts([newWorkout, ...workouts]);
            setName("");
            setSets("");
            setReps("");
            setWeight("");
        }
    };

    const updateWorkout = async (id: number, changes: Partial<Workout>) => {
        const res = await fetch("/api/workouts", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, ...changes }),
        });
        if (!res.ok) return;

        const updated = await res.json();
        setWorkouts(workouts.map(w => (w.id === id ? updated : w)));
    };

    const deleteWorkout = async (id: number) => {
        const res = await fetch(`/api/workouts?id=${id}`, { method: "DELETE" });
        if (!res.ok) return;
        setWorkouts(workouts.filter(w => w.id !== id));
    };

    return (
        <main className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 pb-20 text-gray-900 dark:text-gray-100 transition-colors">
            <h1 className="text-3xl font-bold text-center mb-6">Gym Tracker</h1>

            {/* Add Workout Form */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md mb-6">
                <input
                    className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 w-full p-2 rounded-lg mb-3"
                    placeholder="Exercise name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <div className="flex gap-2 mb-3">
                    <input
                        type="number"
                        className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 w-1/3 p-2 rounded-lg"
                        placeholder="Sets"
                        value={sets}
                        onChange={e => setSets((e.target.value))}
                    />
                    <input
                        type="number"
                        className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 w-1/3 p-2 rounded-lg"
                        placeholder="Reps"
                        value={reps}
                        onChange={e => setReps((e.target.value))}
                    />
                    <input
                        type="number"
                        className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 w-1/3 p-2 rounded-lg"
                        placeholder="Weight"
                        value={weight}
                        onChange={e => setWeight((e.target.value))}
                    />
                </div>
                <button
                    className="bg-blue-600 text-white rounded-lg w-full py-2 active:scale-95 transition-transform disabled:opacity-50"
                    onClick={addWorkout}
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Workout"}
                </button>
            </div>

            {/* Workouts List */}
            <div className="space-y-3">
                {workouts.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        No workouts yet.
                    </p>
                ) : (
                    workouts.map(w => (
                        <div
                            key={w.id}
                            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md flex flex-col gap-3"
                        >
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-lg">{w.name}</p>
                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm active:scale-95"
                                    onClick={() => deleteWorkout(w.id)}
                                >
                                    Delete
                                </button>
                            </div>

                            {/* Editable Controls */}
                            <div className="flex justify-between text-center">
                                {[
                                    { label: "Sets", key: "sets", value: w.sets },
                                    { label: "Reps", key: "reps", value: w.reps },
                                    { label: "Weight", key: "weight", value: w.weight },
                                ].map(item => (
                                    <div key={item.key}>
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                                            {item.label}
                                        </p>
                                        <div className="flex items-center gap-2 justify-center">
                                            <button
                                                className="bg-gray-200 dark:bg-gray-700 px-2 rounded"
                                                onClick={() =>
                                                    updateWorkout(w.id, {
                                                        [item.key]:
                                                            item.value > 0 ? item.value - 1 : item.value,
                                                    })
                                                }
                                                disabled={item.value <= 0}
                                            >
                                                -
                                            </button>
                                            <span className="w-8 text-center">{item.value}</span>
                                            <button
                                                className="bg-gray-200 dark:bg-gray-700 px-2 rounded"
                                                onClick={() =>
                                                    updateWorkout(w.id, {
                                                        [item.key]: item.value + 1,
                                                    })
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Floating Add Button */}
            <button
                onClick={() => {
                    const el = document.querySelector("input");
                    el?.scrollIntoView({ behavior: "smooth" });
                    (el as HTMLInputElement)?.focus();
                }}
                className="fixed bottom-5 right-5 bg-blue-600 text-white text-3xl w-14 h-14 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            >
                +
            </button>
        </main>
    );
}
