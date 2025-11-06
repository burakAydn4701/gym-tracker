
import {NextResponse} from "next/server";
import pool from "@/lib/db";

// GET workouts
export async function GET() {
    try {
        const result = await pool.query("SELECT * FROM workouts ORDER BY created_at ASC");
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error("GET error: ", error);
        return NextResponse.json({error: String(error)}, {status: 500});
    }
}

// POST new workout
export async function POST(req: Request) {
    try {
        const {name, sets, reps, weight} = await req.json();
        const result = await pool.query(
            "INSERT INTO workouts (name, sets, reps, weight) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, sets, reps, weight]
        )
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error("POST error: ", error);
        return NextResponse.json({error: String(error)}, {status: 500})
    }
}

// Edit workout
export async function PATCH(req: Request) {
    try {
        const {id, name, sets, reps, weight} = await req.json();

        const result = await pool.query(
            `UPDATE workouts 
            SET
                name = COALESCE($2, name),
                sets = COALESCE($3, sets),
                reps = COALESCE($4, reps),
                weight = COALESCE($5, weight)
            where id = $1
            RETURNING *`,
            [id, name, sets, reps, weight]
        )

        if (result.rows.length === 0)
            return NextResponse.json({error: "Workout not found."}, {status: 404});

        return NextResponse.json(result.rows[0])

    } catch (error) {
        console.error("PATCH error: ", error);
        return NextResponse.json({error: String(error)}, {status: 500})
    }
}

export async function DELETE(req: Request) {
    try {
        const {searchParams} = new URL(req.url);
        const id = searchParams.get("id");

        if (!id)
            return NextResponse.json({error: "Missing id."}, {status: 404});

        const result = await pool.query(
            `DELETE FROM workouts WHERE id = $1 RETURNING *`,
            [id]
        )

        if (result.rows.length === 0)
            return NextResponse.json({error: "Workout not found"}, {status: 404})

        return NextResponse.json({success: true})
    } catch (error) {
        console.error("DELETE error: ", error);
        return NextResponse.json({error: String(error)}, {status: 500});
    }
}

